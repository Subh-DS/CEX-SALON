"""Server-side coupon catalog. Discounts are computed HERE — never trust client math."""

from app.core.errors import ApiError


class Coupon:
    def __init__(self, code: str, label: str, kind: str, value: float):
        self.code = code
        self.label = label
        self.kind = kind  # "flat" | "percent"
        self.value = value


COUPONS: dict[str, Coupon] = {
    "BLUSH100": Coupon("BLUSH100", "Flat ₹100 off", "flat", 100),
    "WELCOME20": Coupon("WELCOME20", "20% off your visit", "percent", 20),
}


def discount_for(code: str | None, subtotal: float) -> tuple[Coupon | None, float]:
    """Returns (coupon, discount). Raises ApiError INVALID_COUPON for unknown codes."""
    if not code:
        return None, 0.0
    coupon = COUPONS.get(code.strip().upper())
    if coupon is None:
        raise ApiError("INVALID_COUPON", f"“{code.strip().upper()}” isn't a valid promo code.", 422)
    if coupon.kind == "flat":
        discount = min(coupon.value, subtotal)
    else:
        discount = round(subtotal * coupon.value / 100, 2)
    return coupon, min(discount, subtotal)
