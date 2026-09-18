"""Test setup: file-based SQLite DB, seeded, with session dependency overridden."""

import os

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

TEST_DB = "sqlite+aiosqlite:///./test_sundara.db"

os.environ["DATABASE_URL"] = TEST_DB

from app.db.session import get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402
from seeds.seed_dev import seed  # noqa: E402

engine = create_async_engine(TEST_DB, connect_args={"check_same_thread": False})
TestSession = async_sessionmaker(engine, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    if os.path.exists("./test_sundara.db"):
        os.remove("./test_sundara.db")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed()

    async def override_session():
        async with TestSession() as s:
            yield s

    app.dependency_overrides[get_session] = override_session
    yield
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def auth_headers(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "priya@example.com", "password": "customer123"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
