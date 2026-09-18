from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as v1_router
from app.core.config import get_settings
from app.core.errors import ok, register_error_handlers

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")
register_error_handlers(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(v1_router)


@app.get("/health")
async def health():
    return ok({"status": "up", "env": settings.env})
