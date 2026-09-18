import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.users import GUID, new_uuid

ACTIVE_ITEM_STATUSES = ("pending", "confirmed", "in_progress")


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    booking_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    branch_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("branches.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class BookingItem(Base, TimestampMixin):
    __tablename__ = "booking_items"
    __table_args__ = (
        UniqueConstraint("staff_id", "start_time", name="uq_staff_start_time"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    booking_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("bookings.id"), index=True)
    service_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("services.id"), index=True)
    staff_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("staff_profiles.user_id"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)


class BookingStatusHistory(Base):
    __tablename__ = "booking_status_history"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    booking_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("bookings.id"), index=True)
    status: Mapped[str] = mapped_column(String(20))
    changed_by: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("users.id"), nullable=True)
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    booking_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("bookings.id"), unique=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    method: Mapped[str] = mapped_column(String(20), default="mock")  # mock|razorpay
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    transaction_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Integer_BookingNumber_Seq(Base):
    """Helper row for human-readable booking numbers (SND-000123)."""

    __tablename__ = "booking_number_seq"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    last_number: Mapped[int] = mapped_column(Integer, default=0)
