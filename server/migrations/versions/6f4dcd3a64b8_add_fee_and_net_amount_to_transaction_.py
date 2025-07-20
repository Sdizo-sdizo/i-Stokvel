"""Add fee and net_amount to Transaction model

Revision ID: 6f4dcd3a64b8
Revises: 46fe82fb5a45
Create Date: 2025-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6f4dcd3a64b8'
down_revision = '46fe82fb5a45'
branch_labels = None
depends_on = None


def upgrade():
    # The fee and net_amount columns already exist, so skip adding them.
    # with op.batch_alter_table('transaction', schema=None) as batch_op:
    #     batch_op.add_column(sa.Column('fee', sa.Float(), nullable=True, default=0.0))
    # op.execute("UPDATE transaction SET fee = 0.0 WHERE fee IS NULL")
    # with op.batch_alter_table('transaction', schema=None) as batch_op:
    #     batch_op.alter_column('fee', nullable=False)
    # with op.batch_alter_table('transaction', schema=None) as batch_op:
    #     batch_op.add_column(sa.Column('net_amount', sa.Float(), nullable=True))
    # op.execute("UPDATE transaction SET net_amount = amount WHERE net_amount IS NULL")
    # with op.batch_alter_table('transaction', schema=None) as batch_op:
    #     batch_op.alter_column('net_amount', nullable=False)
    pass


def downgrade():
    # with op.batch_alter_table('transaction', schema=None) as batch_op:
    #     batch_op.drop_column('net_amount')
    #     batch_op.drop_column('fee')
    pass

    op.create_table(
        'beneficiary',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('account_number', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('beneficiary_user_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('beneficiary_pkey'))
    )
