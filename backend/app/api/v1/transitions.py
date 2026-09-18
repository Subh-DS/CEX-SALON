from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.bookings import Booking, BookingItem, BookingStatusHistory
from app.models.salon import Service
from app.repositories import bookings as repo

router = APIRouter(prefix="/bookings", tags=["booking-transitions"])

VALID_TRANSITIONS = {
    "pending": ("confirmed", "cancelled"),
    "confirmed": ("in_progress", "cancelled", "no_show"),
    "in_progress": ("completed", "no_show"),
    "completed": (),
    "cancelled": (),
    "no_show": (),
}


class StatusRequest(BaseModel):
    status: str


class RescheduleItem(BaseModel):
    item_id: str
    start_time: datetime


class RescheduleRequest(BaseModel):
    items: list[RescheduleItem]


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


@router.post("/{booking_id}/status")
async def set_status(
    booking_id: str,
    payload: StatusRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    if user["role"] not in ("staff", "admin"):
        raise ApiError("FORBIDDEN", "Only staff can update appointment status.", 403)
    booking = (
        await session.execute(select(Booking).where(Booking.id == booking_id))
    ).scalar_one_or_none()
    if booking is None:
        raise ApiError("NOT_FOUND", "Booking not found.", 404)
    if user["role"] == "staff":
        own = (
            await session.execute(
                select(BookingItem).where(BookingItem.booking_id == booking.id, BookingItem.staff_id == user["id"])
            )
        ).scalar_one_or_none()
        if own is None:
            raise ApiError("FORBIDDEN", "You can only update your own appointments.", 403)
    if payload.status not in VALID_TRANSITIONS.get(booking.status, ()):
        raise ApiError(
            "INVALID_STATUS_TRANSITION",
            f"Can't move from {booking.status} to {payload.status}.",
            422,
        )
    booking.status = payload.status
    items = (
        await session.execute(select(BookingItem).where(BookingItem.booking_id == booking.id))
    ).scalars().all()
    for bi in items:
        bi.status = payload.status
    session.add(
        BookingStatusHistory(booking_id=booking.id, status=payload.status, changed_by=user["id"])
    )
    points_awarded = 0
    if payload.status == "completed":
        from app.services.loyalty_service import award_visit_completion

        points_awarded = await award_visit_completion(session, booking)
    await session.commit()
    return ok({"id": str(booking.id), "status": booking.status, "points_awarded": points_awarded})


@router.post("/{booking_id}/reschedule")
async def reschedule(
    booking_id: str,
    payload: RescheduleRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    booking = (
        await session.execute(select(Booking).where(Booking.id == booking_id))
    ).scalar_one_or_none()
    if booking is None:
        raise ApiError("NOT_FOUND", "Booking not found.", 404)
    if user["role"] == "customer" and str(booking.customer_id) != user["id"]:
        raise ApiError("FORBIDDEN", "You can't reschedule this booking.", 403)
    if user["role"] == "staff":
        own = (
            await session.execute(
                select(BookingItem).where(BookingItem.booking_id == booking.id, BookingItem.staff_id == user["id"])
            )
        ).scalar_one_or_none()
        if own is None:
            raise ApiError("FORBIDDEN", "You can only reschedule your own appointments.", 403)
    if booking.status not in ("pending", "confirmed"):
        raise ApiError("INVALID_STATUS", f"Can't reschedule a {booking.status} booking.", 422)

    for req_item in payload.items:
        bi = (
            await session.execute(
                select(BookingItem).where(
                    BookingItem.id == req_item.item_id, BookingItem.booking_id == booking.id
                )
            )
        ).scalar_one_or_none()
        if bi is None:
            raise ApiError("NOT_FOUND", "Booking item not found.", 404)
        start = _aware(req_item.start_time)
        if start <= datetime.now(timezone.utc):
            raise ApiError("INVALID_TIME", "Please choose a future time.", 422)
        service = (
            await session.execute(select(Service).where(Service.id == bi.service_id))
        ).scalar_one()
        end = start + timedelta(minutes=service.duration_minutes)

        hours = await repo.working_hours(session, str(bi.staff_id), start.weekday())
        if hours is None or not (hours.start_time <= start.time() and end.time() <= hours.end_time):
            raise ApiError("OUTSIDE_WORKING_HOURS", "That time is outside working hours.", 422)
        if await repo.staff_blocked(session, str(bi.staff_id), start, end):
            raise ApiError("STAFF_UNAVAILABLE", "That expert is unavailable at the chosen time.", 409)
        clashes = await repo.overlapping_items(session, str(bi.staff_id), start, end)
        clashes = [c for c in clashes if str(c.id) != str(bi.id)]
        if clashes:
            raise ApiError("BOOKING_CONFLICT", "That time was just taken. Please choose another slot.", 409)

        bi.start_time = start
        bi.end_time = end

    session.add(
        BookingStatusHistory(booking_id=booking.id, status=booking.status, changed_by=user["id"], reason="rescheduled")
    )
    await session.commit()
    return ok({"id": str(booking.id), "status": booking.status})
