from fastapi import APIRouter

from app.api.v1 import admin, auth, availability, bookings, catalog, loyalty, payments, reviews, transitions

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(catalog.router)
router.include_router(availability.router)
router.include_router(bookings.router)
router.include_router(loyalty.router)
router.include_router(admin.router)
router.include_router(payments.router)
router.include_router(reviews.router)
router.include_router(transitions.router)
