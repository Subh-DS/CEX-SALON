from datetime import datetime

from pydantic import BaseModel, Field


class BookingItemCreate(BaseModel):
    service_id: str
    staff_id: str
    start_time: datetime


class BookingCreate(BaseModel):
    branch_id: str | None = None
    notes: str | None = Field(default=None, max_length=500)
    items: list[BookingItemCreate] = Field(min_length=1)


class BookingItemOut(BaseModel):
    id: str
    service_id: str
    service_name: str
    staff_id: str
    staff_name: str
    start_time: datetime
    end_time: datetime
    price: float
    status: str


class BookingOut(BaseModel):
    id: str
    booking_number: str
    status: str
    total_amount: float
    notes: str | None
    items: list[BookingItemOut]


class AvailabilityQuery(BaseModel):
    staff_id: str
    date: str  # YYYY-MM-DD
    service_id: str
