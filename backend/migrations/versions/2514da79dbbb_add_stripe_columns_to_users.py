"""add_stripe_columns_to_users

Revision ID: 2514da79dbbb
Revises: f54a8f027386
Create Date: 2024-03-07 19:43:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2514da79dbbb'
down_revision: Union[str, None] = 'f54a8f027386'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add Stripe-related columns to users table
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(), nullable=True, unique=True))
    op.add_column('users', sa.Column('subscription_id', sa.String(), nullable=True, unique=True))
    op.add_column('users', sa.Column('subscription_status', sa.String(), nullable=True))
    
    # Add unique constraints
    op.create_unique_constraint('uq_users_stripe_customer_id', 'users', ['stripe_customer_id'])
    op.create_unique_constraint('uq_users_subscription_id', 'users', ['subscription_id'])


def downgrade() -> None:
    # Remove unique constraints first
    op.drop_constraint('uq_users_stripe_customer_id', 'users', type_='unique')
    op.drop_constraint('uq_users_subscription_id', 'users', type_='unique')
    
    # Remove columns
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'subscription_id')
    op.drop_column('users', 'subscription_status')
