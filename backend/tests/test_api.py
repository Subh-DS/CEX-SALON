async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "up"


async def test_register_login(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "testuser@example.com", "password": "password123"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["data"]["access_token"]

    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "password123"},
    )
    assert r.status_code == 200

    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "wrongpass1"},
    )
    assert r.status_code == 401


async def test_catalog(client):
    r = await client.get("/api/v1/services")
    assert r.status_code == 200
    assert len(r.json()["data"]) == 6

    r = await client.get("/api/v1/services/categories")
    assert r.status_code == 200
    assert len(r.json()["data"]) == 3


async def test_unauthorized_bookings(client):
    r = await client.get("/api/v1/bookings")
    assert r.status_code == 401
