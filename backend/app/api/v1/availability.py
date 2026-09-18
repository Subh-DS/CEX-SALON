from datetime import datetime, time, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.salon import Service, StaffAvailability, StaffBlock
from app.repositories import bookings as repo
from app.schemas.admin import AvailabilityIn, BlockIn
from app.services.booking_service import build_slots

router = APIRouter(tags=["availability"])


@router.get("/availability")
async def availability(
    staff_id: str,
    date: str,  # YYYY-MM-DD
    service_id: str,
    session: AsyncSession = Depends(session_dep),
):
    try:
        day = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise ApiError("INVALID_DATE", "Date must be YYYY-MM-DD.", 422)

    service = await repo.staff_offers_service(session, staff_id, service_id)
    if service is None:
        raise ApiError("INVALID_SERVICE_STAFF", "That expert doesn't offer the selected service.", 422)

    hours = await repo.working_hours(session, staff_id, day.weekday())
    if hours is None:
        return ok({"date": date, "slots": []})

    day_start = datetime.combine(day, time.min).replace(tzinfo=timezone.utc)
    day_end = datetime.combine(day, time.max).replace(tzinfo=timezone.utc)
    items = await repo.day_items(session, staff_id, day_start, day_end)
    busy = [(i.start_time, i.end_time) for i in items]

    blocks = (
        await session.execute(
            select(StaffBlock).where(
                StaffBlock.staff_id == staff_id,
                StaffBlock.start_datetime < day_end,
                StaffBlock.end_datetime > day_start,
            )
        )
    ).scalars().all()
    busy += [(b.start_datetime, b.end_datetime) for b in blocks]

    slots = build_slots(
        hours.start_time.strftime("%H:%M"),
        hours.end_time.strftime("%H:%M"),
        30,
        service.duration_minutes,
        busy,
        day,
    )
    # Hide past slots for today
    now = datetime.now(timezone.utc)
    result = [
        s if datetime.combine(day, datetime.strptime(s["time"], "%H:%M").time()).replace(tzinfo=timezone.utc) > now
        else {"time": s["time"], "available": False}
        for s in slots
    ]
    return ok({"date": date, "slots": result})


def _parse_clock(value: str) -> time:
    try:
        return datetime.strptime(value, "%H:%M").time()
    except ValueError:
        raise ApiError("INVALID_TIME", "Times must be HH:MM.", 422)


@router.get("/staff/availability")
async def my_availability(
    staff_id: str | None = None,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    """Own weekly hours for staff; admin may pass ?staff_id= to inspect anyone."""
    target = staff_id or user["id"]
    if user["role"] == "staff" and target != user["id"]:
        raise ApiError("FORBIDDEN", "You can only view your own availability.", 403)
    if user["role"] not in ("staff", "admin"):
        raise ApiError("FORBIDDEN", "Staff only.", 403)
    rows = (
        await session.execute(
            select(StaffAvailability).where(StaffAvailability.staff_id == target).order_by(StaffAvailability.day_of_week)
        )
    ).scalars().all()
    by_day = {
        r.day_of_week: {
            "day_of_week": r.day_of_week,
            "start_time": r.start_time.strftime("%H:%M"),
            "end_time": r.end_time.strftime("%H:%M"),
            "is_active": r.is_active,
        }
        for r in rows
    }
    return ok([by_day.get(d, {"day_of_week": d, "start_time": "09:00", "end_time": "19:00", "is_active": d != 6}) for d in range(7)])


@router.put("/staff/availability")
async def save_availability(
    payload: AvailabilityIn,
    user: dict = Depends(require_role("staff")),
    session: AsyncSession = Depends(session_dep),
):
    for day in payload.days:
        start = _parse_clock(day.start_time)
        end = _parse_clock(day.end_time)
        if start >= end:
            raise ApiError("INVALID_TIME", "Start must be before end.", 422)
        row = (
            await session.execute(
                select(StaffAvailability).where(
                    StaffAvailability.staff_id == user["id"], StaffAvailability.day_of_week == day.day_of_week
                )
            )
        ).scalar_one_or_none()
        if row is None:
            row = StaffAvailability(staff_id=user["id"], day_of_week=day.day_of_week, start_time=start, end_time=end, is_active=day.is_active)
            session.add(row)
        else:
            row.start_time = start
            row.end_time = end
            row.is_active = day.is_active
    await session.commit()
    return ok({"saved": len(payload.days)})


@router.get("/staff/blocks")
async def my_blocks(
    user: dict = Depends(require_role("staff")),
    session: AsyncSession = Depends(session_dep),
):
    rows = (
        await session.execute(
            select(StaffBlock).where(StaffBlock.staff_id == user["id"]).order_by(StaffBlock.start_datetime)
        )
    ).scalars().all()
    return ok(
        [
            {"id": str(b.id), "start_datetime": b.start_datetime.isoformat(), "end_datetime": b.end_datetime.isoformat(), "reason": b.reason}
            for b in rows
        ]
    )


@router.post("/staff/blocks")
async def add_block(
    payload: BlockIn,
    user: dict = Depends(require_role("staff")),
    session: AsyncSession = Depends(session_dep),
):
    try:
        start = datetime.fromisoformat(payload.start_datetime)
        end = datetime.fromisoformat(payload.end_datetime)
    except ValueError:
        raise ApiError("INVALID_DATETIME", "Datetimes must be ISO format.", 422)
    if start >= end:
        raise ApiError("INVALID_DATETIME", "Start must be before end.", 422)
    block = StaffBlock(staff_id=user["id"], start_datetime=start, end_datetime=end, reason=payload.reason)
    session.add(block)
    await session.commit()
    return ok({"id": str(block.id)})


@router.delete("/staff/blocks/{block_id}")
async def remove_block(
    block_id: str,
    user: dict = Depends(require_role("staff")),
    session: AsyncSession = Depends(session_dep),
):
    block = (
        await session.execute(select(StaffBlock).where(StaffBlock.id == block_id, StaffBlock.staff_id == user["id"]))
    ).scalar_one_or_none()
    if block is None:
        raise ApiError("NOT_FOUND", "Time off entry not found.", 404)
    await session.delete(block)
    await session.commit()
    return ok({"deleted": block_id})
