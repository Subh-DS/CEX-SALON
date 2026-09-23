from app.core.security import hash_password
from app.models.users import User
from tests.conftest import TestSession


async def _ensure_admin():
    from app.models.loyalty import LoyaltyAccount
    from app.models.users import CustomerProfile

    async with TestSession() as s:
        from sqlalchemy import select

        existing = (await s.execute(select(User).where(User.email == "admin@sundara.in"))).scalar_one_or_none()
        if existing is None:
            admin = User(email="admin@sundara.in", password_hash=hash_password("admin1234"), role="admin")
            s.add(admin)
            await s.flush()
            # Mirror the register invariant: every user gets profile + loyalty rows.
            s.add(CustomerProfile(user_id=admin.id, name="Admin"))
            s.add(LoyaltyAccount(user_id=admin.id))
            await s.commit()


async def test_me(client, auth_headers):
    r = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["data"]["email"] == "priya@example.com"


async def test_me_unauthenticated(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


async def test_customer_forbidden_admin(client, auth_headers):
    r = await client.get("/api/v1/admin/overview", headers=auth_headers)
    assert r.status_code == 403


async def test_unauthenticated_admin(client):
    r = await client.get("/api/v1/admin/overview")
    assert r.status_code == 401


async def test_staff_login(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "ananya@sundara.in", "password": "staff1234"},
    )
    assert r.status_code == 200
    assert r.json()["data"]["user"]["role"] == "staff"


async def test_admin_overview(client):
    await _ensure_admin()
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@sundara.in", "password": "admin1234"},
    )
    assert r.status_code == 200
    token = r.json()["data"]["access_token"]
    r = await client.get("/api/v1/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["total_staff"] == 3
    assert data["total_customers"] >= 1
