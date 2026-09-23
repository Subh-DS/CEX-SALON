"""Booking coupons: code + server-computed discount (Stage 9: promo support).

Note: 0001 builds schema from current models via create_all, so on fresh
databases these columns may already exist. Add/drop is conditional to stay
re-runnable across fresh, dev, and migrated databases.
"""

revision = "0003_booking_coupons"
down_revision = "0001_initial"

from alembic import op
import sqlalchemy as sa


def _have_column(bind, table: str, column: str) -> bool:
    return any(c["name"] == column for c in sa.inspect(bind).get_columns(table))


def upgrade():
    bind = op.get_bind()
    if not _have_column(bind, "bookings", "coupon_code"):
        op.add_column("bookings", sa.Column("coupon_code", sa.String(32), nullable=True))
    if not _have_column(bind, "bookings", "discount_amount"):
        op.add_column(
            "bookings",
            sa.Column("discount_amount", sa.Numeric(10, 2), nullable=False, server_default="0"),
        )


def downgrade():
    bind = op.get_bind()
    if _have_column(bind, "bookings", "discount_amount"):
        op.drop_column("bookings", "discount_amount")
    if _have_column(bind, "bookings", "coupon_code"):
        op.drop_column("bookings", "coupon_code")
