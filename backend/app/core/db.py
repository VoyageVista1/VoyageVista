from sqlmodel import Session,  create_engine, select

from app import crud
from app.core.config import settings
from app.models import ADMIN_PERMISSION,  User, UserCreate

engine = create_engine(
    str(settings.DATABASE_URL),
    connect_args={"check_same_thread": False},
)

def init_db(session: Session) -> None:
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
