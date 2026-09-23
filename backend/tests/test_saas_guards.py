"""SaaS guards: error envelope, server-side coupons, role + status enforcement."""

import pytest

from app.core.errors import ApiError
from app.services.coupons import discount_for

_BOOK_HOUR = [13]


async def _book_tuesday(client, cust_headers):
    from datetime import date, timedelta

    services = (await client.get("/api/v1/services")).json()["data"]
    crew = (await client.get("/api/v1/staff")).json()["data"]
    ananya = next(s for s in crew if s["name"] == "Ananya Sharma")
    spa = next(s for s in services if s["name"] == "Hair Spa Ritual")
    day = date.today() + timedelta(days=(8 - date.today().weekday()) % 7 or 7)  # next Tuesday
    hour = _BOOK_HOUR[0]
    _BOOK_HOUR[0] += 1
    r = await client.post(
        "/api/v1/bookings", headers=cust_headers,
        json={"items": [{"service_id": spa["id"], "staff_id": ananya["id"], "start_time": f"{day}T{hour:02d}:00:00+00:00"}]},
    )
    assert r.status_code == 200, r.text
    return r.json()["data"]


async def _staff_headers(client):
    r = await client.post("/api/v1/auth/login", json={"email": "ananya@sundara.in", "password": "staff1234"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def test_envelope_unauthenticated_async(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401
    body = r.json()
    assert body["success"] is False
    assert body["error"]["code"] == "HTTP_401"


async def test_envelope_forbidden_customer(client, auth_headers):
    r = await client.get("/api/v1/admin/overview", headers=auth_headers)
    assert r.status_code == 403
    body = r.json()
    assert body["success"] is False
    assert body["error"]["code"] == "HTTP_403"


async def test_envelope_validation_error(client):
    r = await client.post("/api/v1/auth/register", json={"email": "not-an-email"})
    assert r.status_code == 422
    body = r.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["details"]["errors"]


def test_coupon_math():
    assert discount_for(None, 1000) == (None, 0.0)
    coupon, discount = discount_for("blush100", 998)
    assert coupon.code == "BLUSH100" and discount == 100
    _, capped = discount_for("BLUSH100", 50)
    assert capped == 50  # never exceeds subtotal
    _, pct = discount_for("WELCOME20", 1000)
    assert pct == 200
    with pytest.raises(ApiError) as exc:
        discount_for("NOPE", 1000)
    assert exc.value.code == "INVALID_COUPON"


async def test_pay_applies_server_coupon(client, auth_headers):
    b = await _book_tuesday(client, auth_headers)
    total = b["total_amount"]
    r = await client.post(
        "/api/v1/payments", headers=auth_headers,
        json={"booking_id": b["id"], "coupon_code": "blush100"},
    )
    assert r.status_code == 200, r.text
    d = r.json()["data"]
    assert d["discount"] == 100
    assert d["amount"] == pytest.approx(total - 100)
    assert d["coupon_code"] == "BLUSH100"

    r = await client.get(f"/api/v1/bookings/{b['id']}", headers=auth_headers)
    assert r.json()["data"]["discount_amount"] == pytest.approx(100)


async def test_pay_rejects_bad_coupon(client, auth_headers):
    b = await _book_tuesday(client, auth_headers)
    r = await client.post(
        "/api/v1/payments", headers=auth_headers,
        json={"booking_id": b["id"], "coupon_code": "NOPE"},
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_COUPON"


async def test_pay_completed_booking_blocked(client, auth_headers):
    staff = await _staff_headers(client)
    b = await _book_tuesday(client, auth_headers)
    for status in ("confirmed", "in_progress", "completed"):
        r = await client.post(f"/api/v1/bookings/{b['id']}/status", headers=staff, json={"status": status})
        assert r.status_code == 200, r.text
    r = await client.post("/api/v1/payments", headers=auth_headers, json={"booking_id": b["id"]})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_STATUS"


async def test_pay_cross_user_forbidden(client, auth_headers):
    staff = await _staff_headers(client)
    b = await _book_tuesday(client, auth_headers)
    r = await client.post("/api/v1/payments", headers=staff, json={"booking_id": b["id"]})
    assert r.status_code == 403


async def test_staff_cannot_review(client, auth_headers):
    staff = await _staff_headers(client)
    b = await _book_tuesday(client, auth_headers)
    for status in ("confirmed", "in_progress", "completed"):
        await client.post(f"/api/v1/bookings/{b['id']}/status", headers=staff, json={"status": status})
    r = await client.post("/api/v1/reviews", headers=staff, json={"booking_id": b["id"], "rating": 5})
    assert r.status_code == 403
