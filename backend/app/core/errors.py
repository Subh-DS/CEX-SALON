from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: dict | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def ok(data, meta: dict | None = None) -> dict:
    return {"success": True, "data": data, "meta": meta or {}}


def fail(code: str, message: str, details: dict | None = None) -> dict:
    return {"success": False, "error": {"code": code, "message": message, "details": details or {}}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error_handler(_: Request, exc: ApiError):
        return JSONResponse(status_code=exc.status_code, content=fail(exc.code, exc.message, exc.details))
