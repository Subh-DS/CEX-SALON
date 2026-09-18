from tests.test_transitions import _claim_slot


async def _completed_booking(client, customer_headers, staff_headers):
    """Book → pay → staff completes. Returns booking dict."""
    services = (await client.get("/api/v1/services")).json()["data"]
    spa = next(s for s in services if s["name"] == "Hair Spa Ritual")
    staff = (await client.get("/api/v1/staff", params={"service_id": spa["id"]})).json()["data"][0]
    r = await client.post(
        "/api/v1/bookings",
        json={"items": [{"service_id": spa["id"], "staff_id": staff["id"], "start_time": _claim_slot(9, 0)}]},
        headers=customer_headers,
    )
    assert r.status_code == 200, r.text
    booking = r.json()["data"]
    await client.post("/api/v1/payments", json={"booking_id": booking["id"]}, headers=customer_headers)
    await client.post(
        f"/api/v1/bookings/{booking['id']}/status",
        json={"status": "in_progress"},
        headers=staff_headers,
    )
    r = await client.post(
        f"/api/v1/bookings/{booking['id']}/status",
        json={"status": "completed"},
        headers=staff_headers,
    )
    assert r.status_code == 200
    return booking


async def _staff_headers(client):
    r = await client.post(
        "/api/v1/auth/login", json={"email": "ananya@sundara.in", "password": "staff1234"}
    )
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def test_review_flow(client, auth_headers):
    staff_h = await _staff_headers(client)
    booking = await _completed_booking(client, auth_headers, staff_h)

    # Serialize carries new fields
    r = await client.get(f"/api/v1/bookings/{booking['id']}", headers=auth_headers)
    data = r.json()["data"]
    assert data["paid"] is True
    assert data["items"][0]["duration_minutes"] == 60

    # Non-completed cannot be reviewed tested implicitly; here completed → 200
    r = await client.post(
        "/api/v1/reviews",
        json={"booking_id": booking["id"], "rating": 5, "comment": "Wonderful hair spa."},
        headers=auth_headers,
    )
    assert r.status_code == 200, r.text

    # Duplicate → 409
    r = await client.post(
        "/api/v1/reviews", json={"booking_id": booking["id"], "rating": 4}, headers=auth_headers
    )
    assert r.status_code == 409

    # /me lists it
    r = await client.get("/api/v1/reviews/me", headers=auth_headers)
    assert r.status_code == 200
    assert any(x["booking_id"] == booking["id"] for x in r.json()["data"])


async def test_review_rejects_pending(client, auth_headers):
    services = (await client.get("/api/v1/services")).json()["data"]
    cut = next(s for s in services if s["name"] == "Classic Haircut")
    staff = (await client.get("/api/v1/staff", params={"service_id": cut["id"]})).json()["data"][0]
    r = await client.post(
        "/api/v1/bookings",
        json={"items": [{"service_id": cut["id"], "staff_id": staff["id"], "start_time": _claim_slot(10, 0)}]},
        headers=auth_headers,
    )
    booking = r.json()["data"]
    r = await client.post(
        "/api/v1/reviews", json={"booking_id": booking["id"], "rating": 5}, headers=auth_headers
    )
    assert r.status_code == 422
