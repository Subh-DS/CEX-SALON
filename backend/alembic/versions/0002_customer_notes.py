"""Add internal notes to customer_profiles (Stage 8: staff customer notes)."""

revision = "0002_customer_notes"
down_revision = "0001_initial"

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column("customer_profiles", sa.Column("notes", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("customer_profiles", "notes")
