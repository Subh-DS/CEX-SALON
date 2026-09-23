"""Stage 8: admin analytics/management, staff availability, customer notes, role isolation."""


async def _admin_headers(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Admin", "email": "admin@sundara.in", "password": "admin1234valid"},
    )
    r = await client.post("/api/v1/auth/login", json={"email": "admin@sundara.in", "password": "admin1234"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def _staff_headers(client):
    r = await client.post(
        "/api/v1/auth/login", json={"email": "ananya@sundara.in", "password": "staff1234"}
    )
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def test_admin_analytics_shape(client, auth_headers):
    admin = await _admin_headers(client)
    r = await client.get("/api/v1/admin/analytics", headers=admin)
    assert r.status_code == 200, r.text
    d = r.json()["data"]
    assert set(d) >= {"today", "month", "popular_services", "revenue_7d", "loyalty", "new_customers_7d"}
    assert d["today"]["appointments"] >= 0
    assert 0 <= d["month"]["cancellation_rate"] <= 1


async def test_admin_forbidden_for_customer(client, auth_headers):
    r = await client.get("/api/v1/admin/analytics", headers=auth_headers)
    assert r.status_code == 403


async def test_staff_readonly_analytics(client):
    # Staff may read ops analytics (staff portal), but writes stay admin-only.
    staff = await _staff_headers(client)
    r = await client.get("/api/v1/admin/analytics", headers=staff)
    assert r.status_code == 200, r.text


async def test_customers_and_notes(client):
    admin = await _admin_headers(client)
    staff = await _staff_headers(client)
    r = await client.get("/api/v1/admin/customers", headers=admin)
    assert r.status_code == 200
    customers = r.json()["data"]
    assert any(c["email"] == "priya@example.com" for c in customers)
    priya = next(c for c in customers if c["email"] == "priya@example.com")

    # staff can also read + save notes
    r = await client.put(
        f"/api/v1/admin/customers/{priya['id']}/notes", headers=staff, json={"notes": "Prefers morning slots."}
    )
    assert r.status_code == 200, r.text
    assert r.json()["data"]["notes"] == "Prefers morning slots."

    r = await client.get("/api/v1/admin/customers", headers=admin)
    priya2 = next(c for c in r.json()["data"] if c["email"] == "priya@example.com")
    assert priya2["notes"] == "Prefers morning slots."


async def test_service_crud(client):
    admin = await _admin_headers(client)
    payload = {"name": "Test Blowout", "description": "Quick test", "category": "Hair", "duration_minutes": 30, "price": 499, "is_active": True}
    r = await client.post("/api/v1/admin/services", headers=admin, json=payload)
    assert r.status_code == 200, r.text
    sid = r.json()["data"]["id"]

    r = await client.get("/api/v1/services")
    assert any(s["id"] == sid for s in r.json()["data"])

    payload["price"] = 599
    r = await client.put(f"/api/v1/admin/services/{sid}", headers=admin, json=payload)
    assert r.status_code == 200, r.text


async def test_reward_crud(client):
    admin = await _admin_headers(client)
    r = await client.post(
        "/api/v1/admin/rewards", headers=admin,
        json={"name": "Test Reward", "description": "t", "points_cost": 9999, "is_active": True},
    )
    assert r.status_code == 200, r.text
    rid = r.json()["data"]["id"]
    r = await client.put(
        f"/api/v1/admin/rewards/{rid}", headers=admin,
        json={"name": "Test Reward", "description": "t", "points_cost": 9999, "is_active": False},
    )
    assert r.status_code == 200, r.text


async def test_staff_availability_roundtrip(client):
    staff = await _staff_headers(client)
    r = await client.get("/api/v1/staff/availability", headers=staff)
    assert r.status_code == 200, r.text
    days = r.json()["data"]
    assert len(days) == 7
    assert days[0]["start_time"] == "09:00"  # seeded Mon-Sat hours

    changed = [dict(d, start_time="10:00", end_time="18:00") if d["day_of_week"] == 0 else d for d in days]
    r = await client.put("/api/v1/staff/availability", headers=staff, json={"days": changed})
    assert r.status_code == 200, r.text
    r = await client.get("/api/v1/staff/availability", headers=staff)
    assert r.json()["data"][0]["start_time"] == "10:00"

    bad = [dict(d, start_time="18:00", end_time="10:00") if d["day_of_week"] == 1 else d for d in days]
    r = await client.put("/api/v1/staff/availability", headers=staff, json={"days": bad})
    assert r.status_code == 422


async def test_staff_blocks_roundtrip(client):
    staff = await _staff_headers(client)
    r = await client.post(
        "/api/v1/staff/blocks", headers=staff,
        json={"start_datetime": "2030-01-05T09:00:00+00:00", "end_datetime": "2030-01-05T13:00:00+00:00", "reason": "Training"},
    )
    assert r.status_code == 200, r.text
    bid = r.json()["data"]["id"]
    r = await client.get("/api/v1/staff/blocks", headers=staff)
    assert any(b["id"] == bid for b in r.json()["data"])
    r = await client.delete(f"/api/v1/staff/blocks/{bid}", headers=staff)
    assert r.status_code == 200, r.text


async def test_booking_serialize_includes_customer_for_staff(client, auth_headers):
    staff = await _staff_headers(client)
    # arrange: customer books Ananya next Monday 10:00
    services = (await client.get("/api/v1/services")).json()["data"]
    crew = (await client.get("/api/v1/staff")).json()["data"]
    ananya = next(s for s in crew if s["name"] == "Ananya Sharma")
    spa = next(s for s in services if s["name"] == "Hair Spa Ritual")
    from datetime import date, timedelta
    day = date.today() + timedelta(days=(7 - date.today().weekday()) % 7 or 7)
    r = await client.post(
        "/api/v1/bookings", headers=auth_headers,
        json={"items": [{"service_id": spa["id"], "staff_id": ananya["id"], "start_time": f"{day}T10:00:00+00:00"}]},
    )
    assert r.status_code == 200, r.text

    r = await client.get("/api/v1/bookings", headers=staff)
    assert r.status_code == 200
    mine = [b for b in r.json()["data"] if b.get("customer_name")]
    assert mine, "staff bookings should carry customer identity"
    assert mine[0]["customer_phone"] is not None

    # customer payloads must NOT leak other customers
    r = await client.get("/api/v1/bookings", headers=auth_headers)
    assert all("customer_name" not in b for b in r.json()["data"])
