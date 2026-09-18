from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.loyalty import LoyaltyAccount, LoyaltyTier, LoyaltyTransaction, Reward, RewardRedemption
from app.services.loyalty_service import NEXT_TIER

router = APIRouter(prefix="/loyalty", tags=["loyalty"])


@router.get("/account")
async def account(
    user: dict = Depends(require_role("customer")),
    session: AsyncSession = Depends(session_dep),
):
    acc = (
        await session.execute(select(LoyaltyAccount).where(LoyaltyAccount.user_id == user["id"]))
    ).scalar_one_or_none()
    if acc is None:
        raise ApiError("NO_ACCOUNT", "Loyalty account not found.", 404)
    return ok(
        {
            "points_balance": acc.points_balance,
            "tier": acc.tier,
            "tier_points": acc.total_earned,
            "next_tier_at": NEXT_TIER.get(acc.tier, 4000),
            "total_earned": acc.total_earned,
            "total_redeemed": acc.total_redeemed,
        }
    )


@router.get("/transactions")
async def transactions(
    user: dict = Depends(require_role("customer")),
    session: AsyncSession = Depends(session_dep),
):
    rows = (
        await session.execute(
            select(LoyaltyTransaction)
            .where(LoyaltyTransaction.user_id == user["id"])
            .order_by(LoyaltyTransaction.created_at.desc())
            .limit(50)
        )
    ).scalars().all()
    return ok(
        [
            {
                "id": str(t.id),
                "points": t.points,
                "type": t.type,
                "description": t.description,
                "reference_type": t.reference_type,
                "reference_id": t.reference_id,
                "created_at": t.created_at.isoformat(),
            }
            for t in rows
        ]
    )


@router.get("/rewards")
async def rewards(session: AsyncSession = Depends(session_dep)):
    rows = (
        await session.execute(select(Reward).where(Reward.is_active.is_(True)).order_by(Reward.points_cost))
    ).scalars().all()
    return ok(
        [
            {
                "id": str(r.id),
                "name": r.name,
                "description": r.description,
                "points_cost": r.points_cost,
                "value": float(r.value),
            }
            for r in rows
        ]
    )


@router.get("/tiers")
async def tiers(session: AsyncSession = Depends(session_dep)):
    import json

    rows = (
        await session.execute(select(LoyaltyTier).order_by(LoyaltyTier.display_order))
    ).scalars().all()
    return ok(
        [
            {
                "name": t.name,
                "min_points": t.min_points,
                "benefits": json.loads(t.benefits or "[]"),
            }
            for t in rows
        ]
    )


@router.post("/rewards/{reward_id}/redeem")
async def redeem(
    reward_id: str,
    user: dict = Depends(require_role("customer")),
    session: AsyncSession = Depends(session_dep),
):
    import secrets
    from datetime import datetime, timezone

    reward = (
        await session.execute(select(Reward).where(Reward.id == reward_id))
    ).scalar_one_or_none()
    if reward is None or not reward.is_active:
        raise ApiError("NOT_FOUND", "This reward isn't available.", 404)
    if reward.stock is not None and reward.stock <= 0:
        raise ApiError("OUT_OF_STOCK", "This reward just ran out.", 409)

    acc = (
        await session.execute(select(LoyaltyAccount).where(LoyaltyAccount.user_id == user["id"]))
    ).scalar_one_or_none()
    if acc is None:
        raise ApiError("NO_ACCOUNT", "Loyalty account not found.", 404)
    if acc.points_balance < reward.points_cost:
        raise ApiError(
            "INSUFFICIENT_POINTS",
            f"You need {reward.points_cost - acc.points_balance} more Glow Points for this.",
            422,
        )

    now = datetime.now(timezone.utc)
    code = f"GLOW-{secrets.token_hex(3).upper()}"
    acc.points_balance -= reward.points_cost
    acc.total_redeemed += reward.points_cost
    if reward.stock is not None:
        reward.stock -= 1
    redemption = RewardRedemption(
        user_id=user["id"],
        reward_id=reward.id,
        points_spent=reward.points_cost,
        code=code,
        status="issued",
        created_at=now,
    )
    session.add(redemption)
    session.add(
        LoyaltyTransaction(
            user_id=user["id"],
            points=-reward.points_cost,
            type="redeem",
            description=f"Redeemed: {reward.name}",
            reference_type="reward",
            reference_id=str(redemption.id),
            created_at=now,
        )
    )
    await session.commit()
    return ok(
        {
            "code": code,
            "reward_name": reward.name,
            "points_spent": reward.points_cost,
            "points_balance": acc.points_balance,
        }
    )
