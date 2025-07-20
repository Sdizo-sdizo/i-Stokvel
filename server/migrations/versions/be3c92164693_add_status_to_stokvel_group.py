"""Add status to stokvel_group

Revision ID: be3c92164693
Revises: 58e4e258d708
Create Date: 2025-07-07 18:07:48.763151

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'be3c92164693'
down_revision = '58e4e258d708'
branch_labels = None
depends_on = None

def upgrade():
    # with op.batch_alter_table('group_join_request', schema=None) as batch_op:
    #     batch_op.alter_column('category', ...)
    #     batch_op.alter_column('tier', ...)
    #     batch_op.alter_column('amount', ...)
    #     batch_op.alter_column('reason', ...)
    # with op.batch_alter_table('stokvel_group', schema=None) as batch_op:
    #     batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=True))
    #     batch_op.drop_column('description')
    # with op.batch_alter_table('user', schema=None) as batch_op:
    #     batch_op.alter_column('full_name', ...)
    pass

def downgrade():
    # with op.batch_alter_table('user', schema=None) as batch_op:
    #     batch_op.alter_column('full_name', ...)
    # with op.batch_alter_table('stokvel_group', schema=None) as batch_op:
    #     batch_op.add_column(sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True))
    #     batch_op.drop_column('status')
    # with op.batch_alter_table('group_join_request', schema=None) as batch_op:
    #     batch_op.alter_column('reason', ...)
    #     batch_op.alter_column('amount', ...)
    #     batch_op.alter_column('tier', ...)
    #     batch_op.alter_column('category', ...)
    pass
