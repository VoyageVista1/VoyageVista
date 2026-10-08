"""Merge system_user and user

Revision ID: f4ae5f2f3159
Revises: e1626e5b002b
Create Date: 2026-10-01 14:08:22.793764

"""
import uuid

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'f4ae5f2f3159'
down_revision = 'e1626e5b002b'
branch_labels = None
depends_on = None


# Every table that carries a reference to system_user.user_id, with the column
# holding it and the delete behaviour it had. These columns become UUIDs
# pointing at user.id.
USER_REFERENCES = (
    ('audit_log', 'user_id', 'SET NULL'),
    ('favorite', 'user_id', 'CASCADE'),
    ('feedback', 'user_id', 'CASCADE'),
    ('negotiation', 'employee_id', 'SET NULL'),
    ('note', 'employee_id', 'CASCADE'),
    ('notification', 'recipient_id', 'CASCADE'),
    ('task', 'employee_id', 'SET NULL'),
    ('ticket', 'employee_id', 'SET NULL'),
)

# SQLite cannot alter a column type or a foreign key in place, so alembic has
# to recreate the whole table. A naming convention is needed to be able to
# address the unnamed foreign keys that were created in a0eaed25184e.
NAMING_CONVENTION = {
    'fk': 'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s',
}

PERMISSIONS = ('admin', 'customer_service')

ADMIN_PERMISSION = 'admin'


def create_table_from(definition: sa.Table) -> None:
    """op.create_table takes loose columns, not a Table object."""
    op.create_table(
        definition.name,
        *definition.columns,
        *definition.constraints,
        sqlite_autoincrement=True,
    )


def permission_table() -> sa.Table:
    return sa.Table(
        'permission',
        sa.MetaData(),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint('permission_id'),
        sa.UniqueConstraint('name'),
        sqlite_autoincrement=True,
    )


def user_permission_table() -> sa.Table:
    return sa.Table(
        'user_permission',
        sa.MetaData(),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['permission_id'], ['permission.permission_id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('user_id', 'permission_id'),
    )


def migrate_superusers_to_admin() -> None:
    """Existing superusers keep their access through the admin permission."""
    op.get_bind().execute(
        sa.text(
            'INSERT INTO user_permission (user_id, permission_id)'
            ' SELECT id, (SELECT permission_id FROM permission WHERE name = :admin)'
            ' FROM user WHERE is_superuser = 1'
        ),
        {'admin': ADMIN_PERMISSION},
    )


def drop_is_superuser() -> None:
    with op.batch_alter_table('user') as batch_op:
        batch_op.drop_column('is_superuser')


def copy_system_users() -> dict[int, str]:
    """Insert every system_user row into user, keyed by its old id."""
    connection = op.get_bind()
    system_user = sa.Table('system_user', sa.MetaData(), autoload_with=connection)
    user = sa.Table('user', sa.MetaData(), autoload_with=connection)

    mapping: dict[int, str] = {}
    for row in connection.execute(sa.select(system_user)).mappings():
        new_id = str(uuid.uuid4())
        connection.execute(
            user.insert().values(
                id=new_id,
                email=row['email'],
                is_active=bool(row['is_active']),
                full_name=row['name'],
                # Employees have no password yet; an empty hash can never
                # verify, so they cannot log in until one is set.
                hashed_password='',
                created_at=row['created_at'],
            )
        )
        mapping[row['user_id']] = new_id

    return mapping


def assert_no_orphans(connection: sa.Connection) -> None:
    """SQLite does not enforce foreign keys, so check the references by hand."""
    for table, column, _ in USER_REFERENCES:
        orphan = connection.execute(
            sa.text(
                f'SELECT COUNT(*) FROM "{table}" WHERE "{column}" IS NOT NULL'
                f' AND "{column}" NOT IN (SELECT user_id FROM system_user)'
            )
        ).scalar_one()
        if orphan:
            raise RuntimeError(
                f'Cannot merge system_user into user: {orphan} row(s) in {table}.'
                f'"{column}" reference a system_user that does not exist.'
            )


def rewrite_references(connection: sa.Connection, mapping: dict[int, str]) -> None:
    """Swap the old integer ids for the new uuids before the columns are cast.

    Each update is keyed on an integer, and a rewritten row now holds a uuid,
    so no row can be translated twice.
    """
    for table, column, _ in USER_REFERENCES:
        for old_id, new_id in mapping.items():
            connection.execute(
                sa.text(
                    f'UPDATE "{table}" SET "{column}" = :new_id'
                    f' WHERE "{column}" = :old_id'
                ),
                {'new_id': new_id, 'old_id': old_id},
            )


def retarget_references(upgrade: bool) -> None:
    """Recreate each referencing table with its user reference changed."""
    for table, column, ondelete in USER_REFERENCES:
        # The constraint to drop is the one the table has now, the new one
        # points the other way.
        existing_table = 'system_user' if upgrade else 'user'
        target_table, target_column = (
            ('user', 'id') if upgrade else ('system_user', 'user_id')
        )

        with op.batch_alter_table(table, naming_convention=NAMING_CONVENTION) as batch_op:
            batch_op.drop_constraint(
                f'fk_{table}_{column}_{existing_table}', type_='foreignkey'
            )
            batch_op.alter_column(
                column, type_=sa.Uuid() if upgrade else sa.Integer()
            )
            batch_op.create_foreign_key(
                f'fk_{table}_{column}_{target_table}',
                target_table,
                [column],
                [target_column],
                ondelete=ondelete,
            )


def system_user_table() -> sa.Table:
    return sa.Table(
        'system_user',
        sa.MetaData(),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('department', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column(
            'is_active', sa.Integer(), server_default=sa.text('1'), nullable=False
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=True,
        ),
        sa.CheckConstraint(
            "department IN ('CustomerService', 'ProductDevelopment', 'Sales',"
            " 'Marketing', 'Finance', 'IT', 'Management')",
            name='ck_system_user_department',
        ),
        sa.CheckConstraint('is_active IN (0, 1)', name='ck_system_user_is_active'),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('email'),
        sqlite_autoincrement=True,
    )


def upgrade() -> None:
    connection = op.get_bind()
    assert_no_orphans(connection)

    # Authorisation moves off user.is_superuser and onto a permission, so the
    # old flag is turned into a grant before the column goes away.
    permission = permission_table()
    create_table_from(permission)
    op.bulk_insert(permission, [{'name': name} for name in PERMISSIONS])
    create_table_from(user_permission_table())
    migrate_superusers_to_admin()
    drop_is_superuser()

    mapping = copy_system_users()
    rewrite_references(connection, mapping)
    retarget_references(upgrade=True)
    op.drop_table('system_user')


def downgrade() -> None:
    # The row merge itself is not reversible: user rows that came from
    # system_user keep their uuids and stay in user.
    with op.batch_alter_table('user') as batch_op:
        batch_op.add_column(
            sa.Column(
                'is_superuser',
                sa.Boolean(),
                server_default=sa.text('0'),
                nullable=False,
            )
        )
    op.get_bind().execute(
        sa.text(
            'UPDATE user SET is_superuser = 1 WHERE id IN ('
            ' SELECT user_id FROM user_permission WHERE permission_id = ('
            '  SELECT permission_id FROM permission WHERE name = :admin))'
        ),
        {'admin': ADMIN_PERMISSION},
    )
    op.drop_table('user_permission')
    op.drop_table('permission')

    create_table_from(system_user_table())
    retarget_references(upgrade=False)
