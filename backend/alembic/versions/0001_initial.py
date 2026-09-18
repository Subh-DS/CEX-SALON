"""Initial schema — all tables from SQLAlchemy metadata (portable SQLite/Postgres)."""

from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

from app.models import Base

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
