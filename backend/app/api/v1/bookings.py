from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.bookings import Booking, BookingItem, BookingStatusHistory, Payment
from app.models.salon import Branch, Service
from app.models.users import CustomerProfile, StaffProfile, User
from app.schemas.bookings import BookingCreate
from app.services.booking_service import create_booking

router = APIRouter(prefix="/bookings", tags=["bookings"])


class _Preload:
    """One batched pass over related rows so list endpoints stay O(1) queries."""

    def __init__(self) -> None:
        self.items: dict = {}
        self.services: dict = {}
        self.staff: dict = {}
        self.branches: dict = {}
        self.payments: set = set()
        self.users: dict = {}
        self.profiles: dict = {}
        self.history: dict = {}


async def _preload(session: AsyncSession, bookings: list[Booking], include_customer: bool) -> _Preload:
    pre = _Preload()
    if not bookings:
        return pre
    ids = [b.id for b in bookings]

    all_items = (
        await session.execute(select(BookingItem).where(BookingItem.booking_id.in_(ids)))
    ).scalars().all()
    for bi in all_items:
        pre.items.setdefault(bi.booking_id, []).append(bi)

    svc_ids = list({bi.service_id for bi in all_items})
    if svc_ids:
        for svc in (await session.execute(select(Service).where(Service.id.in_(svc_ids)))).scalars().all():
            pre.services[svc.id] = svc
    staff_ids = list({bi.staff_id for bi in all_items})
    if staff_ids:
        for st in (await session.execute(select(StaffProfile).where(StaffProfile.user_id.in_(staff_ids)))).scalars().all():
            pre.staff[st.user_id] = st

    branch_ids = list({b.branch_id for b in bookings if b.branch_id})
    if branch_ids:
        for br in (await session.execute(select(Branch).where(Branch.id.in_(branch_ids)))).scalars().all():
            pre.branches[br.id] = br

    paid_rows = (
        await session.execute(
            select(Payment.booking_id).where(Payment.booking_id.in_(ids), Payment.status == "completed")
        )
    ).all()
    pre.payments = {r[0] for r in paid_rows}

    if include_customer:
        cust_ids = list({b.customer_id for b in bookings})
        for u in (await session.execute(select(User).where(User.id.in_(cust_ids)))).scalars().all():
            pre.users[u.id] = u
        for p in (await session.execute(select(CustomerProfile).where(CustomerProfile.user_id.in_(cust_ids)))).scalars().all():
            pre.profiles[p.user_id] = p
        for h in (
            await session.execute(
                select(BookingStatusHistory)
                .where(BookingStatusHistory.booking_id.in_(ids))
                .order_by(BookingStatusHistory.created_at)
            )
        ).scalars().all():
            pre.history.setdefault(h.booking_id, []).append(h)
    return pre


def _serialize_one(booking: Booking, pre: _Preload, include_customer: bool = False) -> dict:
    out = []
    for bi in pre.items.get(booking.id, []):
        svc = pre.services.get(bi.service_id)
        if svc is None:
            raise ApiError("NOT_FOUND", "A service on this booking is no longer available.", 404)
        st = pre.staff.get(bi.staff_id)
        if st is None:
            raise ApiError("NOT_FOUND", "An expert on this booking is no longer available.", 404)
        out.append(
            {
                "id": str(bi.id),
                "service_id": str(bi.service_id),
                "service_name": svc.name,
                "staff_id": str(bi.staff_id),
                "staff_name": st.name,
                "start_time": bi.start_time.isoformat(),
                "end_time": bi.end_time.isoformat(),
                "price": float(bi.price),
                "status": bi.status,
                "duration_minutes": svc.duration_minutes,
            }
        )
    branch_name = None
    if booking.branch_id and booking.branch_id in pre.branches:
        br = pre.branches[booking.branch_id]
        branch_name = f"{br.name}, {br.city}"
    out_booking = {
        "id": str(booking.id),
        "booking_number": booking.booking_number,
        "status": booking.status,
        "total_amount": float(booking.total_amount),
        "discount_amount": float(booking.discount_amount or 0),
        "coupon_code": booking.coupon_code,
        "notes": booking.notes,
        "items": out,
        "branch_name": branch_name,
        "paid": booking.id in pre.payments,
    }
    if include_customer:
        cust = pre.users.get(booking.customer_id)
        prof = pre.profiles.get(booking.customer_id)
        out_booking["customer_id"] = str(booking.customer_id)
        out_booking["customer_name"] = prof.name if prof else (cust.email if cust else "")
        out_booking["customer_phone"] = cust.phone if cust else None
        out_booking["customer_notes"] = prof.notes if prof else None
        out_booking["status_history"] = [
            {"status": h.status, "reason": h.reason, "created_at": h.created_at.isoformat() if h.created_at else None}
            for h in pre.history.get(booking.id, [])
        ]
    return out_booking


async def _serialize(session: AsyncSession, booking: Booking, include_customer: bool = False) -> dict:
    pre = await _preload(session, [booking], include_customer)
    return _serialize_one(booking, pre, include_customer)


@router.post("")
async def create(
    payload: BookingCreate,
    user: dict = Depends(require_role("customer")),
    session: AsyncSession = Depends(session_dep),
):
    booking = await create_booking(session, user["id"], payload)
    return ok(await _serialize(session, booking))


@router.get("")
async def my_bookings(
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    if user["role"] == "admin":
        q = select(Booking).order_by(Booking.created_at.desc())
    elif user["role"] == "staff":
        q = (
            select(Booking)
            .join(BookingItem, BookingItem.booking_id == Booking.id)
            .where(BookingItem.staff_id == user["id"])
            .order_by(Booking.created_at.desc())
            .distinct()
        )
    else:
        q = select(Booking).where(Booking.customer_id == user["id"]).order_by(Booking.created_at.desc())
    rows = (await session.execute(q)).scalars().all()
    include = user["role"] in ("staff", "admin")
    pre = await _preload(session, list(rows), include)
    return ok([_serialize_one(b, pre, include_customer=include) for b in rows])


@router.get("/{booking_id}")
async def get_booking(
    booking_id: str,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    booking = (await session.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if booking is None:
        raise ApiError("NOT_FOUND", "Booking not found.", 404)
    if user["role"] == "customer" and str(booking.customer_id) != user["id"]:
        raise ApiError("FORBIDDEN", "You can't view this booking.", 403)
    if user["role"] == "staff":
        own = (
            await session.execute(
                select(BookingItem).where(BookingItem.booking_id == booking.id, BookingItem.staff_id == user["id"])
            )
        ).scalar_one_or_none()
        if own is None:
            raise ApiError("FORBIDDEN", "You can't view this booking.", 403)
    include = user["role"] in ("staff", "admin")
    return ok(await _serialize(session, booking, include_customer=include))


@router.post("/{booking_id}/cancel")
async def cancel(
    booking_id: str,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    booking = (await session.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if booking is None:
        raise ApiError("NOT_FOUND", "Booking not found.", 404)
    if user["role"] == "customer" and str(booking.customer_id) != user["id"]:
        raise ApiError("FORBIDDEN", "You can't cancel this booking.", 403)
    if user["role"] == "staff":
        own = (
            await session.execute(
                select(BookingItem).where(BookingItem.booking_id == booking.id, BookingItem.staff_id == user["id"])
            )
        ).scalar_one_or_none()
        if own is None:
            raise ApiError("FORBIDDEN", "You can only cancel your own appointments.", 403)
    if booking.status in ("completed", "cancelled"):
        raise ApiError("INVALID_STATUS", f"Can't cancel a {booking.status} booking.", 422)
    booking.status = "cancelled"
    items = (await session.execute(select(BookingItem).where(BookingItem.booking_id == booking.id))).scalars().all()
    for bi in items:
        bi.status = "cancelled"
    session.add(BookingStatusHistory(booking_id=booking.id, status="cancelled", changed_by=user["id"]))
    await session.commit()
    return ok(await _serialize(session, booking))
