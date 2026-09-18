import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.users import GUID, new_uuid


class LoyaltyAccount(Base, TimestampMixin):
    __tablename__ = "loyalty_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), primary_key=True)
    points_balance: Mapped[int] = mapped_column(Integer, default=0)
    total_earned: Mapped[int] = mapped_column(Integer, default=0)
    total_redeemed: Mapped[int] = mapped_column(Integer, default=0)
    tier: Mapped[str] = mapped_column(String(20), default="Seed")


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"
    __table_args__ = (
        UniqueConstraint("reference_type", "reference_id", name="uq_loyalty_reference"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    points: Mapped[int] = mapped_column(Integer)  # +earn / -redeem
    type: Mapped[str] = mapped_column(String(20), index=True)  # earn|redeem|bonus|adjust
    description: Mapped[str] = mapped_column(String(255))
    reference_type: Mapped[str] = mapped_column(String(30))  # booking|review|referral|reward|manual
    reference_id: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LoyaltyTier(Base):
    __tablename__ = "loyalty_tiers"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(30), unique=True)
    min_points: Mapped[int] = mapped_column(Integer)
    benefits: Mapped[str] = mapped_column(Text, default="{}")  # JSON
    display_order: Mapped[int] = mapped_column(Integer, default=0)


class Reward(Base, TimestampMixin):
    __tablename__ = "rewards"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    points_cost: Mapped[int] = mapped_column(Integer)
    reward_type: Mapped[str] = mapped_column(String(30), default="coupon")
    value: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    stock: Mapped[int | None] = mapped_column(Integer, nullable=True)


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    reward_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("rewards.id"))
    points_spent: Mapped[int] = mapped_column(Integer)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="issued")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    booking_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("bookings.id"), unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    staff_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("staff_profiles.user_id"), nullable=True)
    rating: Mapped[int] = mapped_column(Integer)
    stylist_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[str] = mapped_column(Text, default="[]")  # JSON list
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    referrer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    referred_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    referred_user_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(30), index=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    data: Mapped[str] = mapped_column(Text, default="{}")  # JSON
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Offer(Base, TimestampMixin):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    discount_type: Mapped[str] = mapped_column(String(20))  # percent|flat
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2))
    min_booking_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    target_tiers: Mapped[str] = mapped_column(Text, default="[]")  # JSON list
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
