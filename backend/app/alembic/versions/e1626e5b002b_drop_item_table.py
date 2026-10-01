"""drop item table

Revision ID: e1626e5b002b
Revises: a0eaed25184e
Create Date: 2026-10-01 11:39:48.580218

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'e1626e5b002b'
down_revision = 'a0eaed25184e'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('item')

def downgrade():
    op.create_table(
        'item',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString, nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('tax', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )