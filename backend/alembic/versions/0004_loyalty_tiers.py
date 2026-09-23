"""Seed reference loyalty tiers (idempotent — only when the table is empty)."""

revision = "0004_loyalty_tiers"
down_revision = "0003_booking_coupons"

import json

from alembic import op
import sqlalchemy as sa

TIERS = [
    ("Seed", 0, 0, ["Earn points from visit one"]),
    ("Bloom", 500, 1, ["5% off services", "Priority booking", "Birthday reward"]),
    ("Flourish", 1500, 2, ["10% off services", "Free add-ons", "Members-only offers"]),
    ("Radiance", 4000, 3, ["15% off services", "Personal stylist", "VIP events"]),
]


def upgrade():
    bind = op.get_bind()
    count = bind.execute(sa.text("SELECT COUNT(*) FROM loyalty_tiers")).scalar()
    if count:
        return
    for name, min_points, order, benefits in TIERS:
        bind.execute(
            sa.text(
                "INSERT INTO loyalty_tiers (id, name, min_points, benefits, display_order) "
                "VALUES (:id, :name, :min_points, :benefits, :display_order)"
            ),
            {
                "id": str(__import__("uuid").uuid4()),
                "name": name,
                "min_points": min_points,
                "benefits": json.dumps(benefits),
                "display_order": order,
            },
        )


def downgrade():
    bind = op.get_bind()
    bind.execute(sa.text("DELETE FROM loyalty_tiers WHERE name IN ('Seed', 'Bloom', 'Flourish', 'Radiance')"))
