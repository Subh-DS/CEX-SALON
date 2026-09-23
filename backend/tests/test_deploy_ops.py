"""Deploy ops: staff provisioning + first-admin bootstrap."""

from tests.conftest import TestSession


async def _admin_headers(client):
    r = await client.post("/api/v1/auth/login", json={"email": "admin@sundara.in", "password": "admin1234"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


async def test_admin_can_provision_staff(client):
    admin = await _admin_headers(client)
    r = await client.post(
        "/api/v1/admin/staff", headers=admin,
        json={"name": "New Stylist", "email": "newstaff@example.com", "password": "staffpass123",
              "specialties": ["Hair"], "experience_years": 2},
    )
    assert r.status_code == 201, r.text
    assert r.json()["data"]["role"] == "staff"

    r = await client.post(
        "/api/v1/auth/login", json={"email": "newstaff@example.com", "password": "staffpass123"}
    )
    assert r.status_code == 200, r.text
    assert r.json()["data"]["user"]["role"] == "staff"


async def test_provision_duplicate_email_409(client):
    admin = await _admin_headers(client)
    body = {"name": "Dup", "email": "ananya@sundara.in", "password": "staffpass123"}
    r = await client.post("/api/v1/admin/staff", headers=admin, json=body)
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "EMAIL_TAKEN"


async def test_provision_forbidden_for_customer(client, auth_headers):
    body = {"name": "Nope", "email": "nope@example.com", "password": "staffpass123"}
    r = await client.post("/api/v1/admin/staff", headers=auth_headers, json=body)
    assert r.status_code == 403


async def test_promote_admin_bootstrap():
    from sqlalchemy import select

    from app.models.users import User
    from app.services.ops import promote_admin

    async with TestSession() as s:
        assert await promote_admin(s, "ghost@example.com") is False
        user = (await s.execute(select(User).where(User.email == "priya@example.com"))).scalar_one()
        assert await promote_admin(s, "priya@example.com") is True
        assert user.role == "admin"
        assert await promote_admin(s, "priya@example.com") is False  # already admin
        user.role = "customer"  # restore seed state for other tests
        await s.commit()
