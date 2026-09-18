from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.bookings import Booking, BookingStatusHistory, Payment
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["payments"])


class PayRequest(BaseModel):
    booking_id: str
    method: str = "mock"


@router.post("")
async def pay(
    payload: PayRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    booking = (
        await session.execute(select(Booking).where(Booking.id == payload.booking_id))
    ).scalar_one_or_none()
    if booking is None:
        raise ApiError("NOT_FOUND", "Booking not found.", 404)
    if str(booking.customer_id) != user["id"]:
        raise ApiError("FORBIDDEN", "You can't pay for this booking.", 403)
    if booking.status == "cancelled":
        raise ApiError("INVALID_STATUS", "Can't pay for a cancelled booking.", 422)

    existing = (
        await session.execute(select(Payment).where(Payment.booking_id == booking.id))
    ).scalar_one_or_none()
    if existing and existing.status == "completed":
        raise ApiError("ALREADY_PAID", "This booking is already paid.", 409)

    # Mock provider: always succeeds. Real Razorpay verification lands in Stage 9.
    now = datetime.now(timezone.utc)
    if existing is None:
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            method="mock",
            status="completed",
            transaction_id=f"MOCK-{booking.booking_number}",
            paid_at=now,
        )
        session.add(payment)
    else:
        existing.status = "completed"
        existing.transaction_id = f"MOCK-{booking.booking_number}"
        existing.paid_at = now

    if booking.status == "pending":
        booking.status = "confirmed"
        from app.models.bookings import BookingItem

        items = (
            await session.execute(select(BookingItem).where(BookingItem.booking_id == booking.id))
        ).scalars().all()
        for bi in items:
            bi.status = "confirmed"
        session.add(BookingStatusHistory(booking_id=booking.id, status="confirmed", changed_by=user["id"]))

    await session.commit()
    return ok(
        {
            "booking_id": str(booking.id),
            "booking_number": booking.booking_number,
            "status": booking.status,
            "amount": float(booking.total_amount),
        }
    )
