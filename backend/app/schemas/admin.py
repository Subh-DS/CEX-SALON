"""Admin + staff operations: analytics, customer notes, catalog/loyalty management."""

from pydantic import BaseModel, EmailStr, Field


class NotesIn(BaseModel):
    notes: str = Field(max_length=2000)


class ServiceIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    category: str = Field(min_length=2, max_length=60)
    duration_minutes: int = Field(ge=5, le=480)
    price: float = Field(ge=0)
    is_active: bool = True


class RewardIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    points_cost: int = Field(ge=1)
    is_active: bool = True


class DayHours(BaseModel):
    day_of_week: int = Field(ge=0, le=6)  # 0=Monday
    start_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    is_active: bool = True


class AvailabilityIn(BaseModel):
    days: list[DayHours]


class BlockIn(BaseModel):
    start_datetime: str
    end_datetime: str
    reason: str | None = Field(default=None, max_length=255)


class StaffIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=20)
    specialties: list[str] = Field(default_factory=list)
    experience_years: int = Field(default=0, ge=0, le=60)
