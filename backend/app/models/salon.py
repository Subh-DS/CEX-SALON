import uuid
from datetime import time as time_cls

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.users import GUID, new_uuid


class Salon(Base, TimestampMixin):
    __tablename__ = "salons"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Branch(Base, TimestampMixin):
    __tablename__ = "branches"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    salon_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("salons.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str] = mapped_column(String(80), default="Bhubaneswar")
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)


class Service(Base, TimestampMixin):
    __tablename__ = "services"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    category_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("service_categories.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class StaffService(Base):
    __tablename__ = "staff_services"
    __table_args__ = (UniqueConstraint("staff_id", "service_id", name="uq_staff_service"),)

    staff_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("staff_profiles.user_id"), primary_key=True)
    service_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("services.id"), primary_key=True)
    custom_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)


class StaffAvailability(Base):
    __tablename__ = "staff_availability"
    __table_args__ = (UniqueConstraint("staff_id", "day_of_week", name="uq_staff_day"),)

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    staff_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("staff_profiles.user_id"), index=True)
    day_of_week: Mapped[int] = mapped_column(Integer)  # 0=Monday
    start_time: Mapped[time_cls] = mapped_column(Time)
    end_time: Mapped[time_cls] = mapped_column(Time)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class StaffBlock(Base, TimestampMixin):
    __tablename__ = "staff_blocks"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=new_uuid)
    staff_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("staff_profiles.user_id"), index=True)
    start_datetime: Mapped[DateTime] = mapped_column(DateTime(timezone=True), index=True)
    end_datetime: Mapped[DateTime] = mapped_column(DateTime(timezone=True))
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
