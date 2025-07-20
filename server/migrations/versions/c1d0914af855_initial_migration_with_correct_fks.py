"""Initial migration with correct FKs

Revision ID: c1d0914af855
Revises: 
Create Date: 2025-06-20 12:26:05.391221

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c1d0914af855'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # op.create_table('conversations', ...)
    # op.create_table('messages', ...)
    # op.drop_table('bank_account')
    # op.drop_table('kyc_verification')
    # op.drop_table('transaction')
    # with op.batch_alter_table('notification_settings', schema=None) as batch_op:
    #     batch_op.add_column(...)
    #     batch_op.drop_column(...)
    # with op.batch_alter_table('user', schema=None) as batch_op:
    #     batch_op.add_column(...)
    #     batch_op.drop_index(...)
    #     batch_op.drop_column(...)
    # with op.batch_alter_table('user_preferences', schema=None) as batch_op:
    #     batch_op.add_column(...)
    pass

def downgrade():
    # with op.batch_alter_table('user_preferences', schema=None) as batch_op:
    #     batch_op.drop_column(...)
    # with op.batch_alter_table('user', schema=None) as batch_op:
    #     batch_op.add_column(...)
    #     batch_op.create_index(...)
    #     batch_op.drop_column(...)
    # with op.batch_alter_table('notification_settings', schema=None) as batch_op:
    #     batch_op.add_column(...)
    #     batch_op.drop_column(...)
    # op.create_table('transaction', ...)
    # op.create_table('kyc_verification', ...)
    # op.create_table('bank_account', ...)
    # op.drop_table('messages')
    # op.drop_table('conversations')
    pass
