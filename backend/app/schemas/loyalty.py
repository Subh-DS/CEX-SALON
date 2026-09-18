from datetime import datetime

from pydantic import BaseModel


class LoyaltyAccountOut(BaseModel):
    points_balance: int
    tier: str
    tier_points: int
    next_tier_at: int
    total_earned: int
    total_redeemed: int


class LoyaltyTransactionOut(BaseModel):
    id: str
    points: int
    type: str
    description: str
    reference_type: str
    created_at: datetime


class RewardOut(BaseModel):
    id: str
    name: str
    description: str | None
    points_cost: int
    value: float
