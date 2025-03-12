"""add_email_verification

Revision ID: 0cc8b12932ce
Revises: 2514da79dbbb
Create Date: 2024-03-09 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0cc8b12932ce'
down_revision = '2514da79dbbb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Since the field already exists in the model, we just need to ensure it exists in the database
    # If it doesn't exist, add it
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'email_verified'
            ) THEN
                ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
            END IF;
        END
        $$;
    """)


def downgrade() -> None:
    # We don't want to remove the column in downgrade as it might contain important user data
    pass
