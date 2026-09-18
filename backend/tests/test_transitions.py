from datetime import datetime, timedelta, timezone


def _next_weekday_at(hour: int, minute: int, day_offset: int = 1) -> str:
    now = datetime.now(timezone.utc)
    d = now + timedelta(days=day_offset)
    while d.weekday() > 5:
        d += timedelta(days=1)
    return d.replace(hour=hour, minute=minute, second=0, microsecond=0).isoformat()


_BOOK_COUNTER = 0
_USED_DATES: set = set()


def _claim_slot(hour: int, minute: int) -> str:
    """Next free Mon-Sat datetime string; each claimed date used only once per run."""
    global _BOOK_COUNTER
    _BOOK_COUNTER += 1
    offset = 4 + _BOOK_COUNTER
    while True:
        d = datetime.now(timezone.utc) + timedelta(days=offset)
        while d.weekday() > 5:
            d += timedelta(days=1)
        if d.date() not in _USED_DATES:
            _USED_DATES.add(d.date())
            return d.replace(hour=hour, minute=minute, second=0, microsecond=0).isoformat()
        offset += 1


async def _book(client, headers):
    services = (await client.get("/api/v1/services")).json()["data"]
    spa = next(s for s in services if s["name"] == "Hair Spa Ritual")
    staff = (await client.get("/api/v1/staff", params={"service_id": spa["id"]})).json()["data"][0]
    r = await client.post(
        "/api/v1/bookings",
        json={"items": [{"service_id": spa["id"], "staff_id": staff["id"], "start_time": _claim_slot(9, 0)}]},
        headers=headers,
    )
    assert r.status_code == 200, r.text
    return r.json()["data"]


async def test_pay_confirms_booking(client, auth_headers):
    booking = await _book(client, auth_headers)
    assert booking["status"] == "pending"

    r = await client.post("/api/v1/payments", json={"booking_id": booking["id"]}, headers=auth_headers)
    assert r.status_code == 200, r.text
    data = r.json()["data"]
    assert data["status"] == "confirmed"
    assert data["booking_number"].startswith("SND-")

    # Double-pay must be rejected
    r2 = await client.post("/api/v1/payments", json={"booking_id": booking["id"]}, headers=auth_headers)
    assert r2.status_code == 409
    assert r2.json()["error"]["code"] == "ALREADY_PAID"


async def test_status_transitions(client, auth_headers):
    booking = await _book(client, auth_headers)
    await client.post("/api/v1/payments", json={"booking_id": booking["id"]}, headers=auth_headers)

    # Customer cannot change status
    r = await client.post(
        f"/api/v1/bookings/{booking['id']}/status", json={"status": "completed"}, headers=auth_headers
    )
    assert r.status_code == 403

    # Staff login
    r = await client.post(
        "/api/v1/auth/login", json={"email": "ananya@sundara.in", "password": "staff1234"}
    )
    staff_h = {"Authorization": f"Bearer {r.json()['data']['access_token']}"}

    # Invalid jump: confirmed -> completed skipped
    r = await client.post(
        f"/api/v1/bookings/{booking['id']}/status", json={"status": "completed"}, headers=staff_h
    )
    assert r.status_code == 422

    r = await client.post(
        f"/api/v1/bookings/{booking['id']}/status", json={"status": "in_progress"}, headers=staff_h
    )
    assert r.status_code == 200
    r = await client.post(
        f"/api/v1/bookings/{booking['id']}/status", json={"status": "completed"}, headers=staff_h
    )
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "completed"


async def test_reschedule(client, auth_headers):
    booking = await _book(client, auth_headers)
    item_id = booking["items"][0]["id"]
    new_start = _next_weekday_at(14, 0, day_offset=2)

    r = await client.post(
        f"/api/v1/bookings/{booking['id']}/reschedule",
        json={"items": [{"item_id": item_id, "start_time": new_start}]},
        headers=auth_headers,
    )
    assert r.status_code == 200, r.text

    r = await client.get(f"/api/v1/bookings/{booking['id']}", headers=auth_headers)
    assert r.json()["data"]["items"][0]["start_time"].startswith(new_start[:16].replace("T", "T")[:13])
