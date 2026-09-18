from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bookings import ACTIVE_ITEM_STATUSES, BookingItem
from app.models.salon import Service, StaffAvailability, StaffBlock, StaffService


async def staff_offers_service(session: AsyncSession, staff_id: str, service_id: str) -> Service | None:
    q = (
        select(Service)
        .join(StaffService, StaffService.service_id == Service.id)
        .where(
            StaffService.staff_id == staff_id,
            StaffService.service_id == service_id,
            Service.is_active.is_(True),
        )
    )
    return (await session.execute(q)).scalar_one_or_none()


async def overlapping_items(
    session: AsyncSession, staff_id: str, start: datetime, end: datetime
) -> list[BookingItem]:
    q = select(BookingItem).where(
        BookingItem.staff_id == staff_id,
        BookingItem.status.in_(ACTIVE_ITEM_STATUSES),
        BookingItem.start_time < end,
        BookingItem.end_time > start,
    )
    return list((await session.execute(q)).scalars().all())


async def staff_blocked(session: AsyncSession, staff_id: str, start: datetime, end: datetime) -> bool:
    q = select(StaffBlock).where(
        StaffBlock.staff_id == staff_id,
        StaffBlock.start_datetime < end,
        StaffBlock.end_datetime > start,
    )
    return (await session.execute(q)).scalar_one_or_none() is not None


async def working_hours(session: AsyncSession, staff_id: str, weekday: int):
    q = select(StaffAvailability).where(
        StaffAvailability.staff_id == staff_id,
        StaffAvailability.day_of_week == weekday,
        StaffAvailability.is_active.is_(True),
    )
    return (await session.execute(q)).scalar_one_or_none()


async def day_items(session: AsyncSession, staff_id: str, day_start: datetime, day_end: datetime):
    q = (
        select(BookingItem)
        .where(
            BookingItem.staff_id == staff_id,
            BookingItem.status.in_(ACTIVE_ITEM_STATUSES),
            BookingItem.start_time >= day_start,
            BookingItem.start_time < day_end,
        )
        .order_by(BookingItem.start_time)
    )
    return list((await session.execute(q)).scalars().all())
