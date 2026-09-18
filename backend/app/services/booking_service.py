from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.models.bookings import Booking, BookingItem, BookingStatusHistory, Integer_BookingNumber_Seq
from app.repositories import bookings as repo
from app.schemas.bookings import BookingCreate


def _ensure_future(start: datetime) -> None:
    now = datetime.now(timezone.utc)
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if start <= now:
        raise ApiError("INVALID_TIME", "Please choose a future time.", 422)


async def _next_booking_number(session: AsyncSession) -> str:
    from sqlalchemy import select

    seq = (await session.execute(select(Integer_BookingNumber_Seq).where(Integer_BookingNumber_Seq.id == 1))).scalar_one_or_none()
    if seq is None:
        seq = Integer_BookingNumber_Seq(id=1, last_number=0)
        session.add(seq)
        await session.flush()
    seq.last_number += 1
    return f"SND-{seq.last_number:06d}"


async def create_booking(session: AsyncSession, customer_id: str, payload: BookingCreate) -> Booking:
    items: list[BookingItem] = []
    total = 0.0

    for item in payload.items:
        start = item.start_time
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        _ensure_future(start)

        service = await repo.staff_offers_service(session, item.staff_id, item.service_id)
        if service is None:
            raise ApiError(
                "INVALID_SERVICE_STAFF",
                "That expert doesn't offer the selected service.",
                422,
                {"service_id": item.service_id, "staff_id": item.staff_id},
            )
        end = start + timedelta(minutes=service.duration_minutes)

        hours = await repo.working_hours(session, item.staff_id, start.weekday())
        if hours is None or not (hours.start_time <= start.time() and end.time() <= hours.end_time):
            raise ApiError("OUTSIDE_WORKING_HOURS", "That time is outside the expert's working hours.", 422)

        if await repo.staff_blocked(session, item.staff_id, start, end):
            raise ApiError("STAFF_UNAVAILABLE", "That expert is unavailable at the chosen time.", 409)

        overlap = await repo.overlapping_items(session, item.staff_id, start, end)
        if overlap:
            raise ApiError(
                "BOOKING_CONFLICT",
                "That time was just taken. Please choose another slot.",
                409,
            )

        price = float(service.price)
        total += price
        items.append(
            BookingItem(
                service_id=service.id,
                staff_id=item.staff_id,
                start_time=start,
                end_time=end,
                price=price,
                status="pending",
            )
        )

    booking = Booking(
        booking_number=await _next_booking_number(session),
        customer_id=customer_id,
        branch_id=payload.branch_id,
        status="pending",
        total_amount=total,
        notes=payload.notes,
    )
    session.add(booking)
    await session.flush()
    for bi in items:
        bi.booking_id = booking.id
        session.add(bi)
    session.add(BookingStatusHistory(booking_id=booking.id, status="pending", changed_by=customer_id))
    await session.commit()
    await session.refresh(booking)
    return booking


def build_slots(
    work_start: str, work_end: str, slot_minutes: int, duration: int, busy: list[tuple[datetime, datetime]], day
) -> list[dict]:
    """Pure slot builder: 30-min grid, slot fits duration, no overlap with busy."""
    from datetime import datetime as dt

    def _aware(d: datetime) -> datetime:
        # SQLite returns naive datetimes; treat them as UTC
        return d if d.tzinfo is not None else d.replace(tzinfo=timezone.utc)

    busy = [(_aware(s), _aware(e)) for s, e in busy]
    slots: list[dict] = []
    cur = dt.combine(day, datetime.strptime(work_start, "%H:%M").time()).replace(tzinfo=timezone.utc)
    end_of_day = dt.combine(day, datetime.strptime(work_end, "%H:%M").time()).replace(tzinfo=timezone.utc)
    while cur + timedelta(minutes=duration) <= end_of_day:
        slot_end = cur + timedelta(minutes=duration)
        clash = any(cur < b_end and slot_end > b_start for b_start, b_end in busy)
        slots.append({"time": cur.strftime("%H:%M"), "available": not clash})
        cur += timedelta(minutes=slot_minutes)
    return slots
