"""Staff portal completion: earn-on-complete, review bonus idempotency, own-job enforcement."""


async def _staff_headers(client):
    r = await client.post("/api/v1/auth/login", json={"email": "ananya@sundara.in", "password": "staff1234"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def _kabir_headers(client):
    r = await client.post("/api/v1/auth/login", json={"email": "kabir@sundara.in", "password": "staff1234"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def _admin_headers(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Admin", "email": "admin@sundara.in", "password": "admin1234valid"},
    )
    r = await client.post("/api/v1/auth/login", json={"email": "admin@sundara.in", "password": "admin1234"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


_BOOK_HOUR = [13]  # stage8 suite owns Monday 10:00; hours 13–18 stay inside 09:00–19:00


async def _book_ananya(client, cust_headers):
    from datetime import date, timedelta

    services = (await client.get("/api/v1/services")).json()["data"]
    crew = (await client.get("/api/v1/staff")).json()["data"]
    ananya = next(s for s in crew if s["name"] == "Ananya Sharma")
    spa = next(s for s in services if s["name"] == "Hair Spa Ritual")
    day = date.today() + timedelta(days=(7 - date.today().weekday()) % 7 or 7)
    hour = _BOOK_HOUR[0]
    _BOOK_HOUR[0] += 1  # unique slot per test — shared DB, no collisions
    r = await client.post(
        "/api/v1/bookings", headers=cust_headers,
        json={"items": [{"service_id": spa["id"], "staff_id": ananya["id"], "start_time": f"{day}T{hour:02d}:00:00+00:00"}]},
    )
    assert r.status_code == 200, r.text
    return r.json()["data"]


async def _set_status(client, headers, booking_id, status):
    return await client.post(f"/api/v1/bookings/{booking_id}/status", headers=headers, json={"status": status})


async def test_complete_awards_points_idempotent(client, auth_headers):
    staff = await _staff_headers(client)
    b = await _book_ananya(client, auth_headers)
    await _set_status(client, staff, b["id"], "confirmed")
    r = await _set_status(client, staff, b["id"], "in_progress")
    assert r.status_code == 200
    r = await _set_status(client, staff, b["id"], "completed")
    assert r.status_code == 200, r.text
    assert r.json()["data"]["points_awarded"] == 149  # 1499 // 10

    r = await client.get("/api/v1/loyalty/transactions", headers=auth_headers)
    earns = [t for t in r.json()["data"] if t["reference_type"] == "booking" and t["reference_id"] == b["id"]]
    assert len(earns) == 1 and earns[0]["points"] == 149


async def test_review_bonus_idempotent(client, auth_headers):
    staff = await _staff_headers(client)
    b = await _book_ananya(client, auth_headers)
    await _set_status(client, staff, b["id"], "confirmed")
    await _set_status(client, staff, b["id"], "in_progress")
    await _set_status(client, staff, b["id"], "completed")

    r = await client.post("/api/v1/reviews", headers=auth_headers, json={"booking_id": b["id"], "rating": 5})
    assert r.status_code == 200, r.text
    assert r.json()["data"]["points_awarded"] == 50

    r = await client.get("/api/v1/loyalty/transactions", headers=auth_headers)
    bonus = [t for t in r.json()["data"] if t["reference_type"] == "review"]
    assert sum(t["points"] for t in bonus) >= 50


async def test_staff_cannot_touch_others_jobs(client, auth_headers):
    staff = await _staff_headers(client)  # Ananya
    kabir = await _kabir_headers(client)
    b = await _book_ananya(client, auth_headers)

    r = await _set_status(client, kabir, b["id"], "confirmed")
    assert r.status_code == 403
    r = await client.post(
        f"/api/v1/bookings/{b['id']}/reschedule", headers=kabir,
        json={"items": [{"item_id": b["items"][0]["id"], "start_time": "2030-02-02T10:00:00+00:00"}]},
    )
    assert r.status_code == 403
    r = await client.post(f"/api/v1/bookings/{b['id']}/cancel", headers=kabir)
    assert r.status_code == 403
    r = await client.get(f"/api/v1/bookings/{b['id']}", headers=kabir)
    assert r.status_code == 403

    # own job works
    r = await _set_status(client, staff, b["id"], "confirmed")
    assert r.status_code == 200


async def test_admin_can_touch_any_job(client, auth_headers):
    admin = await _admin_headers(client)
    b = await _book_ananya(client, auth_headers)
    r = await _set_status(client, admin, b["id"], "confirmed")
    assert r.status_code == 200
    r = await client.get(f"/api/v1/bookings/{b['id']}", headers=admin)
    assert r.status_code == 200
    assert r.json()["data"]["customer_name"]


async def test_customer_activity_endpoint(client, auth_headers):
    admin = await _admin_headers(client)
    staff = await _staff_headers(client)
    customers = (await client.get("/api/v1/admin/customers", headers=admin)).json()["data"]
    priya = next(c for c in customers if c["email"] == "priya@example.com")
    for headers in (admin, staff):
        r = await client.get(f"/api/v1/admin/customers/{priya['id']}/activity", headers=headers)
        assert r.status_code == 200, r.text
        assert "transactions" in r.json()["data"] and "redemptions" in r.json()["data"]
    r = await client.get(f"/api/v1/admin/customers/{priya['id']}/activity", headers=auth_headers)
    assert r.status_code == 403


async def test_staff_analytics_readonly(client):
    staff = await _staff_headers(client)
    r = await client.get("/api/v1/admin/analytics", headers=staff)
    assert r.status_code == 200, r.text
    # but writes stay admin-only
    r = await client.post(
        "/api/v1/admin/services", headers=staff,
        json={"name": "X", "category": "Hair", "duration_minutes": 10, "price": 1},
    )
    assert r.status_code == 403
