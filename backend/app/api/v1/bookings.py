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


async def _serialize(session: AsyncSession, booking: Booking, include_customer: bool = False) -> dict:
    items = (
        await session.execute(select(BookingItem).where(BookingItem.booking_id == booking.id))
    ).scalars().all()
    out = []
    for bi in items:
        svc = (await session.execute(select(Service).where(Service.id == bi.service_id))).scalar_one()
        st = (await session.execute(select(StaffProfile).where(StaffProfile.user_id == bi.staff_id))).scalar_one()
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
    if booking.branch_id:
        branch = (await session.execute(select(Branch).where(Branch.id == booking.branch_id))).scalar_one_or_none()
        if branch:
            branch_name = f"{branch.name}, {branch.city}"
    paid = (
        await session.execute(
            select(Payment).where(Payment.booking_id == booking.id, Payment.status == "completed")
        )
    ).scalar_one_or_none() is not None
    out_booking = {
        "id": str(booking.id),
        "booking_number": booking.booking_number,
        "status": booking.status,
        "total_amount": float(booking.total_amount),
        "notes": booking.notes,
        "items": out,
        "branch_name": branch_name,
        "paid": paid,
    }
    if include_customer:
        cust = (await session.execute(select(User).where(User.id == booking.customer_id))).scalar_one_or_none()
        prof = (
            await session.execute(select(CustomerProfile).where(CustomerProfile.user_id == booking.customer_id))
        ).scalar_one_or_none()
        out_booking["customer_id"] = str(booking.customer_id)
        out_booking["customer_name"] = prof.name if prof else (cust.email if cust else "")
        out_booking["customer_phone"] = cust.phone if cust else None
        out_booking["customer_notes"] = prof.notes if prof else None
        history = (
            await session.execute(
                select(BookingStatusHistory).where(BookingStatusHistory.booking_id == booking.id).order_by(BookingStatusHistory.created_at)
            )
        ).scalars().all()
        out_booking["status_history"] = [
            {"status": h.status, "reason": h.reason, "created_at": h.created_at.isoformat() if h.created_at else None}
            for h in history
        ]
    return out_booking


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
        )
    else:
        q = select(Booking).where(Booking.customer_id == user["id"]).order_by(Booking.created_at.desc())
    rows = (await session.execute(q)).scalars().all()
    include = user["role"] in ("staff", "admin")
    return ok([await _serialize(session, b, include_customer=include) for b in rows])


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
