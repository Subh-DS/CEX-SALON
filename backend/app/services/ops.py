"""Ops helpers: staff provisioning and first-admin bootstrap (needed for deploys)."""

import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import hash_password
from app.models.users import StaffProfile, User
from app.schemas.admin import StaffIn


async def create_staff(session: AsyncSession, payload: StaffIn) -> User:
    existing = (await session.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if existing:
        raise ApiError("EMAIL_TAKEN", "An account with this email already exists.", 409)
    user = User(
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role="staff",
    )
    session.add(user)
    await session.flush()
    session.add(
        StaffProfile(
            user_id=user.id,
            name=payload.name,
            specialties=json.dumps(payload.specialties),
            experience_years=payload.experience_years,
        )
    )
    await session.commit()
    return user


async def promote_admin(session: AsyncSession, email: str) -> bool:
    """Promote an existing user to admin. Returns True if a promotion happened."""
    if not email:
        return False
    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if user is None or user.role == "admin":
        return False
    user.role = "admin"
    await session.commit()
    return True
