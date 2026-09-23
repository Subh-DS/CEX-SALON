from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_session
from app.core.errors import ApiError, ok
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.db.session import get_session as session_dep
from app.models.loyalty import LoyaltyAccount
from app.models.users import CustomerProfile, User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(payload: RegisterRequest, session: AsyncSession = Depends(session_dep)):
    existing = (await session.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if existing:
        raise ApiError("EMAIL_TAKEN", "An account with this email already exists.", 409)
    user = User(email=payload.email, phone=payload.phone, password_hash=hash_password(payload.password), role="customer")
    session.add(user)
    await session.flush()
    session.add(CustomerProfile(user_id=user.id, name=payload.name))
    session.add(LoyaltyAccount(user_id=user.id))
    await session.commit()
    uid = str(user.id)
    return ok(
        {
            "user": {"id": uid, "email": user.email, "role": "customer"},
            "access_token": create_access_token(uid, "customer"),
            "refresh_token": create_refresh_token(uid),
        }
    )


@router.post("/login")
async def login(payload: LoginRequest, session: AsyncSession = Depends(session_dep)):
    user = (await session.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise ApiError("INVALID_CREDENTIALS", "Invalid email or password.", 401)
    if not user.is_active:
        raise ApiError("ACCOUNT_DISABLED", "This account has been disabled.", 403)
    uid = str(user.id)
    return ok(
        {
            "user": {"id": uid, "email": user.email, "role": user.role},
            "access_token": create_access_token(uid, user.role),
            "refresh_token": create_refresh_token(uid),
        }
    )


@router.post("/refresh")
async def refresh(payload: RefreshRequest, session: AsyncSession = Depends(session_dep)):
    try:
        data = decode_token(payload.refresh_token)
    except Exception:
        raise ApiError("INVALID_TOKEN", "Session expired. Please log in again.", 401)
    if data.get("type") != "refresh":
        raise ApiError("INVALID_TOKEN", "Session expired. Please log in again.", 401)
    user = (await session.execute(select(User).where(User.id == data["sub"]))).scalar_one_or_none()
    if user is None or not user.is_active:
        raise ApiError("INVALID_TOKEN", "Session expired. Please log in again.", 401)
    # Rotation: every refresh mints a fresh pair. The previous refresh token stays
    # valid until its own expiry (no server-side revocation list in this stage).
    return ok(
        {
            "access_token": create_access_token(str(user.id), user.role),
            "refresh_token": create_refresh_token(str(user.id)),
        }
    )


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return ok(user)
