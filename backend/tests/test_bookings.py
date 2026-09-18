from datetime import datetime, timedelta, timezone


def _next_weekday_at(hour: int, minute: int) -> str:
    """Next Mon-Sat date at given time (seed staff work Mon-Sat)."""
    now = datetime.now(timezone.utc)
    d = now + timedelta(days=1)
    while d.weekday() > 5:
        d += timedelta(days=1)
    return d.replace(hour=hour, minute=minute, second=0, microsecond=0).isoformat()


async def _ids(client):
    services = (await client.get("/api/v1/services")).json()["data"]
    spa = next(s for s in services if s["name"] == "Hair Spa Ritual")
    staff = (await client.get("/api/v1/staff", params={"service_id": spa["id"]})).json()["data"]
    assert staff, "seed staff must offer Hair Spa"
    return spa["id"], staff[0]["id"]


async def test_booking_and_double_booking_conflict(client, auth_headers):
    service_id, staff_id = await _ids(client)
    start = _next_weekday_at(10, 30)

    r = await client.post(
        "/api/v1/bookings",
        json={"items": [{"service_id": service_id, "staff_id": staff_id, "start_time": start}]},
        headers=auth_headers,
    )
    assert r.status_code == 200, r.text
    assert r.json()["data"]["booking_number"].startswith("SND-")

    # Same staff + overlapping time must conflict
    r2 = await client.post(
        "/api/v1/bookings",
        json={"items": [{"service_id": service_id, "staff_id": staff_id, "start_time": start}]},
        headers=auth_headers,
    )
    assert r2.status_code == 409
    assert r2.json()["error"]["code"] == "BOOKING_CONFLICT"


async def test_invalid_staff_service_combo(client, auth_headers):
    services = (await client.get("/api/v1/services")).json()["data"]
    cut = next(s for s in services if s["name"] == "Classic Haircut")
    facial_staff = (await client.get("/api/v1/staff")).json()["data"]
    divya = next(s for s in facial_staff if s["name"] == "Divya Patnaik")

    r = await client.post(
        "/api/v1/bookings",
        json={
            "items": [
                {"service_id": cut["id"], "staff_id": divya["id"], "start_time": _next_weekday_at(11, 0)}
            ]
        },
        headers=auth_headers,
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_SERVICE_STAFF"


async def test_availability_reflects_booking(client, auth_headers):
    service_id, staff_id = await _ids(client)
    start = _next_weekday_at(15, 0)
    day = start[:10]

    before = await client.get(
        "/api/v1/availability", params={"staff_id": staff_id, "date": day, "service_id": service_id}
    )
    assert before.status_code == 200
    slot_before = next(s for s in before.json()["data"]["slots"] if s["time"] == "15:00")
    assert slot_before["available"] is True

    r = await client.post(
        "/api/v1/bookings",
        json={"items": [{"service_id": service_id, "staff_id": staff_id, "start_time": start}]},
        headers=auth_headers,
    )
    assert r.status_code == 200, r.text

    after = await client.get(
        "/api/v1/availability", params={"staff_id": staff_id, "date": day, "service_id": service_id}
    )
    slot_after = next(s for s in after.json()["data"]["slots"] if s["time"] == "15:00")
    assert slot_after["available"] is False
