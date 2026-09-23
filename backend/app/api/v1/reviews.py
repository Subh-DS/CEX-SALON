from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.core.errors import ApiError, ok
from app.db.session import get_session as session_dep
from app.models.bookings import Booking
from app.models.loyalty import Review

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    stylist_rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)
    tags: list[str] = Field(default_factory=list)


@router.post("")
async def create_review(
    payload: ReviewCreate,
    user: dict = Depends(require_role("customer")),
    session: AsyncSession = Depends(session_dep),
):
    booking = (
        await session.execute(select(Booking).where(Booking.id == payload.booking_id))
    ).scalar_one_or_none()
    if booking is None:
        raise ApiError("NOT_FOUND", "Booking not found.", 404)
    if str(booking.customer_id) != user["id"]:
        raise ApiError("FORBIDDEN", "You can't review this visit.", 403)
    if booking.status != "completed":
        raise ApiError("INVALID_STATUS", "Only completed visits can be reviewed.", 422)
    existing = (
        await session.execute(select(Review).where(Review.booking_id == booking.id))
    ).scalar_one_or_none()
    if existing:
        raise ApiError("REVIEW_EXISTS", "This visit already has a review.", 409)

    from app.models.bookings import BookingItem

    items = (
        await session.execute(select(BookingItem).where(BookingItem.booking_id == booking.id))
    ).scalars().all()
    staff_id = items[0].staff_id if items else None

    review = Review(
        booking_id=booking.id,
        customer_id=user["id"],
        staff_id=staff_id,
        rating=payload.rating,
        stylist_rating=payload.stylist_rating,
        comment=payload.comment,
        tags="[" + ",".join(f'"{t}"' for t in payload.tags) + "]",
        created_at=datetime.now(timezone.utc),
    )
    session.add(review)
    await session.flush()  # populate review.id for the idempotent bonus reference
    from app.services.loyalty_service import award_review_bonus

    points_awarded = await award_review_bonus(session, user["id"], review)
    await session.commit()
    return ok({"id": str(review.id), "booking_id": str(booking.id), "rating": review.rating, "points_awarded": points_awarded})


@router.get("/me")
async def my_reviews(
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(session_dep),
):
    rows = (
        await session.execute(select(Review).where(Review.customer_id == user["id"]))
    ).scalars().all()
    return ok([{"booking_id": str(r.booking_id), "rating": r.rating} for r in rows])
