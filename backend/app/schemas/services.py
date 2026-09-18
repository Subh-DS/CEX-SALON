from pydantic import BaseModel


class ServiceOut(BaseModel):
    id: str
    name: str
    description: str | None
    duration_minutes: int
    price: float
    category: str
    category_id: str


class CategoryOut(BaseModel):
    id: str
    name: str
    description: str | None


class StaffOut(BaseModel):
    id: str
    name: str
    rating: float
    review_count: int
    specialties: list[str]
    experience_years: int
