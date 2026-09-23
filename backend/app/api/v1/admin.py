from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.bookings import Booking, BookingItem, Payment
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction, Review, Reward
from app.models.salon import Service, ServiceCategory
from app.models.users import CustomerProfile, User
from app.schemas.admin import NotesIn, RewardIn, ServiceIn, StaffIn
from app.services.ops import create_staff

router = APIRouter(prefix="/admin", tags=["admin"])

admin_only = require_role("admin")
ops_roles = require_role("admin", "staff")


@router.post("/staff", status_code=201)
async def create_staff_member(
    payload: StaffIn,
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    """Provision a staff login + profile (needed for deploys; register only makes customers)."""
    created = await create_staff(session, payload)
    return ok({"id": str(created.id), "email": created.email, "role": created.role})


@router.get("/overview")
async def overview(
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    total_bookings = (await session.execute(select(func.count()).select_from(Booking))).scalar()
    total_customers = (
        await session.execute(select(func.count()).select_from(User).where(User.role == "customer"))
    ).scalar()
    total_staff = (
        await session.execute(select(func.count()).select_from(User).where(User.role == "staff"))
    ).scalar()
    return ok(
        {
            "total_bookings": total_bookings,
            "total_customers": total_customers,
            "total_staff": total_staff,
        }
    )


@router.get("/analytics")
async def analytics(
    user: dict = Depends(ops_roles),
    session: AsyncSession = Depends(session_dep),
):
    """Operational numbers, all computed from real rows (UTC, naive-safe for SQLite)."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    todays_items = (
        await session.execute(
            select(func.count())
            .select_from(BookingItem)
            .where(BookingItem.start_time >= today_start)
        )
    ).scalar() or 0

    todays_revenue = (
        await session.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == "completed", Payment.created_at >= today_start
            )
        )
    ).scalar() or 0

    month_total = (
        await session.execute(select(func.count()).select_from(Booking).where(Booking.created_at >= month_ago))
    ).scalar() or 0
    month_cancelled = (
        await session.execute(
            select(func.count()).select_from(Booking).where(Booking.created_at >= month_ago, Booking.status == "cancelled")
        )
    ).scalar() or 0

    popular = (
        await session.execute(
            select(Service.name, func.count(BookingItem.id), func.coalesce(func.sum(BookingItem.price), 0))
            .join(BookingItem, BookingItem.service_id == Service.id)
            .where(BookingItem.created_at >= month_ago)
            .group_by(Service.name)
            .order_by(func.count(BookingItem.id).desc())
            .limit(5)
        )
    ).all()

    revenue_by_day = (
        await session.execute(
            select(func.date(Payment.created_at), func.coalesce(func.sum(Payment.amount), 0))
            .where(Payment.status == "completed", Payment.created_at >= week_ago)
            .group_by(func.date(Payment.created_at))
            .order_by(func.date(Payment.created_at))
        )
    ).all()

    points_issued = (
        await session.execute(
            select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(LoyaltyTransaction.points > 0)
        )
    ).scalar() or 0
    points_redeemed = (
        await session.execute(
            select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(LoyaltyTransaction.points < 0)
        )
    ).scalar() or 0

    new_customers = (
        await session.execute(
            select(func.count()).select_from(User).where(User.role == "customer", User.created_at >= week_ago)
        )
    ).scalar() or 0

    return ok(
        {
            "today": {"appointments": todays_items, "revenue": float(todays_revenue)},
            "month": {
                "bookings": month_total,
                "cancelled": month_cancelled,
                "cancellation_rate": round(month_cancelled / month_total, 3) if month_total else 0,
            },
            "popular_services": [
                {"name": n, "bookings": c, "revenue": float(r)} for n, c, r in popular
            ],
            "revenue_7d": [{"day": str(d), "revenue": float(r)} for d, r in revenue_by_day],
            "loyalty": {"issued": int(points_issued), "redeemed": abs(int(points_redeemed))},
            "new_customers_7d": new_customers,
        }
    )


@router.get("/customers")
async def customers(
    user: dict = Depends(ops_roles),
    session: AsyncSession = Depends(session_dep),
):
    rows = (
        await session.execute(
            select(User, CustomerProfile, LoyaltyAccount)
            .outerjoin(CustomerProfile, CustomerProfile.user_id == User.id)
            .outerjoin(LoyaltyAccount, LoyaltyAccount.user_id == User.id)
            .where(User.role == "customer")
            .order_by(User.created_at.desc())
        )
    ).all()
    out = []
    counts = dict(
        (
            await session.execute(
                select(Booking.customer_id, func.count())
                .where(Booking.customer_id.in_([u.id for u, _, _ in rows]))
                .group_by(Booking.customer_id)
            )
        ).all()
    )
    for u, p, acct in rows:
        out.append(
            {
                "id": str(u.id),
                "email": u.email,
                "phone": u.phone,
                "name": p.name if p else u.email,
                "notes": p.notes if p else None,
                "bookings": counts.get(u.id, 0),
                "points": acct.points_balance if acct else 0,
                "tier": acct.tier if acct else None,
            }
        )
    return ok(out)


@router.put("/customers/{customer_id}/notes")
async def save_notes(
    customer_id: str,
    payload: NotesIn,
    user: dict = Depends(ops_roles),
    session: AsyncSession = Depends(session_dep),
):
    profile = (
        await session.execute(select(CustomerProfile).where(CustomerProfile.user_id == customer_id))
    ).scalar_one_or_none()
    if profile is None:
        raise ApiError("NOT_FOUND", "Customer not found.", 404)
    profile.notes = payload.notes.strip() or None
    await session.commit()
    return ok({"id": customer_id, "notes": profile.notes})


@router.get("/rewards")
async def all_rewards(
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    rows = (await session.execute(select(Reward).order_by(Reward.points_cost))).scalars().all()
    return ok(
        [
            {
                "id": str(r.id),
                "name": r.name,
                "description": r.description,
                "points_cost": r.points_cost,
                "value": float(r.value),
                "is_active": r.is_active,
            }
            for r in rows
        ]
    )


@router.get("/customers/{customer_id}/activity")
async def customer_activity(
    customer_id: str,
    user: dict = Depends(ops_roles),
    session: AsyncSession = Depends(session_dep),
):
    from app.models.loyalty import RewardRedemption

    txns = (
        await session.execute(
            select(LoyaltyTransaction)
            .where(LoyaltyTransaction.user_id == customer_id)
            .order_by(LoyaltyTransaction.created_at.desc())
            .limit(50)
        )
    ).scalars().all()
    reds = (
        await session.execute(
            select(RewardRedemption).where(RewardRedemption.user_id == customer_id).order_by(RewardRedemption.created_at.desc()).limit(20)
        )
    ).scalars().all()
    reward_names = {}
    if reds:
        for rw in (
            await session.execute(select(Reward).where(Reward.id.in_([r.reward_id for r in reds])))
        ).scalars().all():
            reward_names[rw.id] = rw.name
    out_reds = []
    for r in reds:
        out_reds.append(
            {
                "id": str(r.id),
                "reward": reward_names.get(r.reward_id, "Reward"),
                "points_spent": r.points_spent,
                "code": r.code,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
        )
    return ok(
        {
            "transactions": [
                {
                    "id": str(t.id),
                    "points": t.points,
                    "type": t.type,
                    "description": t.description,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in txns
            ],
            "redemptions": out_reds,
        }
    )


@router.get("/reviews")
async def all_reviews(
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    rows = (await session.execute(select(Review).order_by(Review.created_at.desc()).limit(200))).scalars().all()
    bookings_by_id = {}
    if rows:
        for b in (
            await session.execute(select(Booking).where(Booking.id.in_([r.booking_id for r in rows])))
        ).scalars().all():
            bookings_by_id[b.id] = b
    names = {}
    cust_ids = list({b.customer_id for b in bookings_by_id.values()})
    if cust_ids:
        for p in (
            await session.execute(select(CustomerProfile).where(CustomerProfile.user_id.in_(cust_ids)))
        ).scalars().all():
            names[p.user_id] = p.name
    out = []
    for r in rows:
        booking = bookings_by_id.get(r.booking_id)
        out.append(
            {
                "id": str(r.id),
                "rating": r.rating,
                "stylist_rating": r.stylist_rating,
                "comment": r.comment,
                "tags": r.tags,
                "customer": names.get(booking.customer_id) if booking else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
        )
    return ok(out)


async def _category_id(session: AsyncSession, name: str):
    cat = (
        await session.execute(select(ServiceCategory).where(ServiceCategory.name == name))
    ).scalar_one_or_none()
    if cat is None:
        cat = ServiceCategory(name=name)
        session.add(cat)
        await session.flush()
    return cat.id


@router.post("/services")
async def create_service(
    payload: ServiceIn,
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    svc = Service(
        category_id=await _category_id(session, payload.category),
        name=payload.name,
        description=payload.description,
        duration_minutes=payload.duration_minutes,
        price=payload.price,
        is_active=payload.is_active,
    )
    session.add(svc)
    await session.commit()
    return ok({"id": str(svc.id), "name": svc.name})


@router.put("/services/{service_id}")
async def update_service(
    service_id: str,
    payload: ServiceIn,
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    svc = (await session.execute(select(Service).where(Service.id == service_id))).scalar_one_or_none()
    if svc is None:
        raise ApiError("NOT_FOUND", "Service not found.", 404)
    svc.category_id = await _category_id(session, payload.category)
    svc.name = payload.name
    svc.description = payload.description
    svc.duration_minutes = payload.duration_minutes
    svc.price = payload.price
    svc.is_active = payload.is_active
    await session.commit()
    return ok({"id": str(svc.id), "name": svc.name})


@router.post("/rewards")
async def create_reward(
    payload: RewardIn,
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    reward = Reward(name=payload.name, description=payload.description, points_cost=payload.points_cost, is_active=payload.is_active)
    session.add(reward)
    await session.commit()
    return ok({"id": str(reward.id), "name": reward.name})


@router.put("/rewards/{reward_id}")
async def update_reward(
    reward_id: str,
    payload: RewardIn,
    user: dict = Depends(admin_only),
    session: AsyncSession = Depends(session_dep),
):
    reward = (await session.execute(select(Reward).where(Reward.id == reward_id))).scalar_one_or_none()
    if reward is None:
        raise ApiError("NOT_FOUND", "Reward not found.", 404)
    reward.name = payload.name
    reward.description = payload.description
    reward.points_cost = payload.points_cost
    reward.is_active = payload.is_active
    await session.commit()
    return ok({"id": str(reward.id), "name": reward.name})
