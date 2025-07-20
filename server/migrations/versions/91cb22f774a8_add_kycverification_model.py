"""Add KYCVerification model

Revision ID: 91cb22f774a8
Revises: 7aa1cd241600
Create Date: 2025-06-20 17:46:50.805272

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '91cb22f774a8'
down_revision = '7aa1cd241600'
branch_labels = None
depends_on = None

def upgrade():
    # op.create_table('kyc_verification',
    #     sa.Column('id', sa.Integer(), nullable=False),
    #     sa.Column('user_id', sa.Integer(), nullable=False),
    #     ... (all other columns) ...
    #     sa.PrimaryKeyConstraint('id')
    # )
    pass

def downgrade():
    # op.drop_table('kyc_verification')
    pass
