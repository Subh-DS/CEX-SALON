import json

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ok
from app.db.session import get_session as session_dep
from app.models.salon import Service, ServiceCategory, StaffService
from app.models.users import StaffProfile

router = APIRouter(tags=["catalog"])


@router.get("/services/categories")
async def categories(session: AsyncSession = Depends(session_dep)):
    rows = (await session.execute(select(ServiceCategory).order_by(ServiceCategory.display_order))).scalars().all()
    return ok([{"id": str(c.id), "name": c.name, "description": c.description} for c in rows])


@router.get("/services")
async def list_services(
    category: str | None = Query(default=None),
    session: AsyncSession = Depends(session_dep),
):
    q = (
        select(Service, ServiceCategory.name)
        .join(ServiceCategory, Service.category_id == ServiceCategory.id)
        .where(Service.is_active.is_(True))
        .order_by(Service.name)
    )
    if category:
        q = q.where(ServiceCategory.name == category)
    rows = (await session.execute(q)).all()
    return ok(
        [
            {
                "id": str(s.id),
                "name": s.name,
                "description": s.description,
                "duration_minutes": s.duration_minutes,
                "price": float(s.price),
                "category": cat_name,
                "category_id": str(s.category_id),
            }
            for s, cat_name in rows
        ]
    )


@router.get("/staff")
async def list_staff(
    service_id: str | None = Query(default=None),
    session: AsyncSession = Depends(session_dep),
):
    q = select(StaffProfile)
    if service_id:
        q = q.join(StaffService, StaffService.staff_id == StaffProfile.user_id).where(
            StaffService.service_id == service_id
        )
    rows = (await session.execute(q)).scalars().all()
    return ok(
        [
            {
                "id": str(s.user_id),
                "name": s.name,
                "rating": s.rating,
                "review_count": s.review_count,
                "specialties": json.loads(s.specialties or "[]"),
                "experience_years": s.experience_years,
            }
            for s in rows
        ]
    )
