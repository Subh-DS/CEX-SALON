TIERS = [
    ("Seed", 0),
    ("Bloom", 500),
    ("Flourish", 1500),
    ("Radiance", 4000),
]

NEXT_TIER = {"Seed": 500, "Bloom": 1500, "Flourish": 4000, "Radiance": 4000}

REVIEW_BONUS_POINTS = 50
REFERRAL_BONUS_POINTS = 200


def points_for_amount(amount: float) -> int:
    """1 point per ₹10 spent, rounded down."""
    return int(amount // 10)


def tier_for_lifetime_earned(total_earned: int) -> str:
    current = "Seed"
    for name, threshold in TIERS:
        if total_earned >= threshold:
            current = name
    return current


async def _get_or_create_account(session, user_id):
    from sqlalchemy import select

    from app.models.loyalty import LoyaltyAccount

    acc = (
        await session.execute(select(LoyaltyAccount).where(LoyaltyAccount.user_id == user_id))
    ).scalar_one_or_none()
    if acc is None:
        acc = LoyaltyAccount(user_id=user_id, points_balance=0, total_earned=0, total_redeemed=0, tier="Seed")
        session.add(acc)
        await session.flush()
    return acc


async def _already_awarded(session, user_id, reference_type: str, reference_id: str) -> bool:
    from sqlalchemy import select

    from app.models.loyalty import LoyaltyTransaction

    existing = (
        await session.execute(
            select(LoyaltyTransaction).where(
                LoyaltyTransaction.user_id == user_id,
                LoyaltyTransaction.reference_type == reference_type,
                LoyaltyTransaction.reference_id == reference_id,
            )
        )
    ).scalar_one_or_none()
    return existing is not None


async def _credit(session, user_id, points: int, type: str, description: str, reference_type: str, reference_id: str, now) -> bool:
    """Idempotent credit: returns True if a new ledger row was written."""
    from app.models.loyalty import LoyaltyTransaction

    if points <= 0:
        return False
    if await _already_awarded(session, user_id, reference_type, reference_id):
        return False
    acc = await _get_or_create_account(session, user_id)
    acc.points_balance += points
    acc.total_earned += points
    acc.tier = tier_for_lifetime_earned(acc.total_earned)
    session.add(
        LoyaltyTransaction(
            user_id=user_id,
            points=points,
            type=type,
            description=description,
            reference_type=reference_type,
            reference_id=reference_id,
            created_at=now,
        )
    )
    return True


async def award_visit_completion(session, booking) -> int:
    """Earn 1 pt per ₹10 on completion. Idempotent per booking. Returns points awarded."""
    from datetime import datetime, timezone

    points = points_for_amount(float(booking.total_amount or 0))
    wrote = await _credit(
        session,
        booking.customer_id,
        points,
        "earn",
        f"Earned from visit {booking.booking_number}",
        "booking",
        str(booking.id),
        datetime.now(timezone.utc),
    )
    return points if wrote else 0


async def award_review_bonus(session, customer_id, review) -> int:
    """+50 for a review. Idempotent per review. Returns points awarded."""
    from datetime import datetime, timezone

    wrote = await _credit(
        session,
        customer_id,
        REVIEW_BONUS_POINTS,
        "bonus",
        "Bonus for reviewing your visit",
        "review",
        str(review.id),
        datetime.now(timezone.utc),
    )
    return REVIEW_BONUS_POINTS if wrote else 0
