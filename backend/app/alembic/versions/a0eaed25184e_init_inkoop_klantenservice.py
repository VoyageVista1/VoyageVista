"""init Inkoop&Klantenservice

Revision ID: a0eaed25184e
Revises: b0369848c224
Create Date: 2026-10-01 11:34:22.546191

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'a0eaed25184e'
down_revision = 'b0369848c224'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # ### commands auto generated to match sql_schema_english.sql ###
    op.create_table('system_user',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('department', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('role', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('is_active', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint("department IN ('CustomerService', 'ProductDevelopment', 'Sales', 'Marketing', 'Finance', 'IT', 'Management')", name='ck_system_user_department'),
    sa.CheckConstraint('is_active IN (0, 1)', name='ck_system_user_is_active'),
    sa.PrimaryKeyConstraint('user_id'),
    sa.UniqueConstraint('email'),
    sqlite_autoincrement=True
    )
    op.create_table('customer',
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('first_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('last_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('phone_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('is_active', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint('is_active IN (0, 1)', name='ck_customer_is_active'),
    sa.PrimaryKeyConstraint('customer_id'),
    sa.UniqueConstraint('email'),
    sqlite_autoincrement=True
    )
    op.create_table('supplier',
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('phone_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('postal_code', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('city', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('country', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('is_active', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('last_modified', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint('is_active IN (0, 1)', name='ck_supplier_is_active'),
    sa.PrimaryKeyConstraint('supplier_id'),
    sqlite_autoincrement=True
    )
    op.create_table('development_project',
    sa.Column('development_project_id', sa.Integer(), nullable=False),
    sa.Column('project_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('launch_deadline', sa.Date(), nullable=False),
    sa.Column('status', sa.Text(), server_default=sa.text("'Ideation'"), nullable=False),
    sa.PrimaryKeyConstraint('development_project_id'),
    sqlite_autoincrement=True
    )
    op.create_table('ticket_category',
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.PrimaryKeyConstraint('category_id'),
    sqlite_autoincrement=True
    )
    op.create_table('knowledge_base_article',
    sa.Column('knowledge_base_article_id', sa.Integer(), nullable=False),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('category', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('last_modified', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('status', sa.Text(), server_default=sa.text("'Active'"), nullable=False),
    sa.PrimaryKeyConstraint('knowledge_base_article_id'),
    sqlite_autoincrement=True
    )
    op.create_table('contract',
    sa.Column('contract_id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('contract_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('contract_value', sa.Numeric(10, 2), nullable=True),
    sa.Column('terms', sa.Text(), nullable=True),
    sa.Column('status', sa.Text(), server_default=sa.text("'Active'"), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('last_modified', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint('end_date > start_date', name='ck_contract_valid_period'),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.supplier_id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('contract_id'),
    sqlite_autoincrement=True
    )
    with op.batch_alter_table('contract', schema=None) as batch_op:
        batch_op.create_index('idx_contract_supplier', ['supplier_id'], unique=False)

    op.create_table('negotiation',
    sa.Column('negotiation_id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('employee_id', sa.Integer(), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('status', sa.Text(), server_default=sa.text("'In Negotiation'"), nullable=False),
    sa.Column('subject', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('remarks', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['employee_id'], ['system_user.user_id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.supplier_id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('negotiation_id'),
    sqlite_autoincrement=True
    )
    op.create_table('travel_component',
    sa.Column('component_id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('category', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('purchase_price', sa.Float(), nullable=False),
    sa.Column('currency', sa.Text(), server_default=sa.text("'EUR'"), nullable=True),
    sa.Column('current_availability', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('is_active', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('last_modified', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint('current_availability IN (0, 1)', name='ck_travel_component_availability'),
    sa.CheckConstraint('is_active IN (0, 1)', name='ck_travel_component_is_active'),
    sa.ForeignKeyConstraint(['supplier_id'], ['supplier.supplier_id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('component_id'),
    sqlite_autoincrement=True
    )
    with op.batch_alter_table('travel_component', schema=None) as batch_op:
        batch_op.create_index('idx_travelcomponent_supplier', ['supplier_id'], unique=False)

    op.create_table('ticket',
    sa.Column('ticket_id', sa.Integer(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('employee_id', sa.Integer(), nullable=True),
    sa.Column('subject', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('priority', sa.Text(), server_default=sa.text("'Normal'"), nullable=False),
    sa.Column('status', sa.Text(), server_default=sa.text("'New'"), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('last_modified', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('sla_deadline', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['customer_id'], ['customer.customer_id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['employee_id'], ['system_user.user_id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('ticket_id'),
    sqlite_autoincrement=True
    )
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.create_index('idx_ticket_customer', ['customer_id'], unique=False)
        batch_op.create_index('idx_ticket_status', ['status'], unique=False)

    op.create_table('audit_log',
    sa.Column('log_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('table_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('record_id', sa.Integer(), nullable=False),
    sa.Column('action', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('old_value', sa.Text(), nullable=True),
    sa.Column('new_value', sa.Text(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['system_user.user_id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('log_id'),
    sqlite_autoincrement=True
    )
    op.create_table('notification',
    sa.Column('notification_id', sa.Integer(), nullable=False),
    sa.Column('recipient_id', sa.Integer(), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('is_read', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint('is_read IN (0, 1)', name='ck_notification_is_read'),
    sa.ForeignKeyConstraint(['recipient_id'], ['system_user.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('notification_id'),
    sqlite_autoincrement=True
    )
    op.create_table('note',
    sa.Column('note_id', sa.Integer(), nullable=False),
    sa.Column('employee_id', sa.Integer(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['employee_id'], ['system_user.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('note_id'),
    sqlite_autoincrement=True
    )
    op.create_table('task',
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('development_project_id', sa.Integer(), nullable=False),
    sa.Column('employee_id', sa.Integer(), nullable=True),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('deadline', sa.DateTime(), nullable=False),
    sa.Column('status', sa.Text(), server_default=sa.text("'Open'"), nullable=False),
    sa.ForeignKeyConstraint(['development_project_id'], ['development_project.development_project_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['employee_id'], ['system_user.user_id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('task_id'),
    sqlite_autoincrement=True
    )
    op.create_table('project_travel_component',
    sa.Column('development_project_id', sa.Integer(), nullable=False),
    sa.Column('component_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['component_id'], ['travel_component.component_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['development_project_id'], ['development_project.development_project_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('development_project_id', 'component_id')
    )
    op.create_table('price_history',
    sa.Column('price_history_id', sa.Integer(), nullable=False),
    sa.Column('component_id', sa.Integer(), nullable=False),
    sa.Column('old_price', sa.Numeric(10, 2), nullable=False),
    sa.Column('new_price', sa.Numeric(10, 2), nullable=False),
    sa.Column('change_date', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['component_id'], ['travel_component.component_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('price_history_id'),
    sqlite_autoincrement=True
    )
    op.create_table('milestone',
    sa.Column('milestone_id', sa.Integer(), nullable=False),
    sa.Column('development_project_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('deadline', sa.Date(), nullable=False),
    sa.Column('status', sa.Text(), server_default=sa.text("'Planned'"), nullable=False),
    sa.ForeignKeyConstraint(['development_project_id'], ['development_project.development_project_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('milestone_id'),
    sqlite_autoincrement=True
    )
    op.create_table('product_media',
    sa.Column('product_media_id', sa.Integer(), nullable=False),
    sa.Column('component_id', sa.Integer(), nullable=False),
    sa.Column('media_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('file_location', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('added_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['component_id'], ['travel_component.component_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('product_media_id'),
    sqlite_autoincrement=True
    )
    op.create_table('contact_event',
    sa.Column('contact_event_id', sa.Integer(), nullable=False),
    sa.Column('ticket_id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.Column('channel', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('direction', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['ticket_id'], ['ticket.ticket_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('contact_event_id'),
    sqlite_autoincrement=True
    )
    op.create_table('customer_satisfaction',
    sa.Column('customer_satisfaction_id', sa.Integer(), nullable=False),
    sa.Column('ticket_id', sa.Integer(), nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.Column('date', sa.Date(), server_default=sa.text("(DATE('now'))"), nullable=True),
    sa.CheckConstraint('score BETWEEN 1 AND 5', name='ck_customer_satisfaction_score'),
    sa.ForeignKeyConstraint(['ticket_id'], ['ticket.ticket_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('customer_satisfaction_id'),
    sa.UniqueConstraint('ticket_id'),
    sqlite_autoincrement=True
    )
    op.create_table('feedback',
    sa.Column('feedback_id', sa.Integer(), nullable=False),
    sa.Column('component_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('read_by_buyer', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.CheckConstraint('read_by_buyer IN (0, 1)', name='ck_feedback_read_by_buyer'),
    sa.ForeignKeyConstraint(['component_id'], ['travel_component.component_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['system_user.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('feedback_id'),
    sqlite_autoincrement=True
    )
    op.create_table('favorite',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('component_id', sa.Integer(), nullable=False),
    sa.Column('added_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['component_id'], ['travel_component.component_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['system_user.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'component_id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated ###
    op.drop_table('favorite')
    op.drop_table('feedback')
    op.drop_table('customer_satisfaction')
    op.drop_table('contact_event')
    op.drop_table('product_media')
    op.drop_table('milestone')
    op.drop_table('price_history')
    op.drop_table('project_travel_component')
    op.drop_table('task')
    op.drop_table('note')
    op.drop_table('notification')
    op.drop_table('audit_log')
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.drop_index('idx_ticket_status')
        batch_op.drop_index('idx_ticket_customer')

    op.drop_table('ticket')
    with op.batch_alter_table('travel_component', schema=None) as batch_op:
        batch_op.drop_index('idx_travelcomponent_supplier')

    op.drop_table('travel_component')
    op.drop_table('negotiation')
    with op.batch_alter_table('contract', schema=None) as batch_op:
        batch_op.drop_index('idx_contract_supplier')

    op.drop_table('contract')
    op.drop_table('knowledge_base_article')
    op.drop_table('ticket_category')
    op.drop_table('development_project')
    op.drop_table('supplier')
    op.drop_table('customer')
    op.drop_table('system_user')
    # ### end Alembic commands ###

