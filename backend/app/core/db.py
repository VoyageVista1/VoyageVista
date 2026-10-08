from sqlmodel import Session, SQLModel, create_engine, select

from app import crud
from app.core.config import settings
from app.models import ADMIN_PERMISSION, Permission, User, UserCreate

engine = create_engine(
    str(settings.DATABASE_URL),
    connect_args={"check_same_thread": False},
)


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Ensure tables exist. In deployed environments tables are created with
    # Alembic migrations (see prestart.sh), but generate-client.sh and a fresh
    # local sqlite DB may import the app before migrations have run.
    # create_all is idempotent (checkfirst=True), so it is safe when
    # migrations already created the tables.
    # This works because the models are already imported and registered from app.models
    SQLModel.metadata.create_all(engine)

    # Ensure the permission rows exist (migrations seed them, but a DB created
    # via create_all above would have an empty permission table).
    for permission_name in {ADMIN_PERMISSION, "customer_service"}:
        permission = session.exec(
            select(Permission).where(Permission.name == permission_name)
        ).first()
        if not permission:
            session.add(Permission(name=permission_name))
    session.commit()

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            permissions=[ADMIN_PERMISSION],
        )
        user = crud.create_user(session=session, user_create=user_in)
    else:
        crud.grant_permission(session=session, user=user, name=ADMIN_PERMISSION)
        session.commit()
