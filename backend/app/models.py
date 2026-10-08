import uuid
from datetime import UTC, datetime

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(UTC)


# Name of the permission that grants access to the admin endpoints.
ADMIN_PERMISSION = "admin"


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    permissions: list[str] = Field(default_factory=list)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    permissions: list[str] | None = None


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Join table between users and the permissions they hold
class UserPermission(SQLModel, table=True):
    __tablename__ = "user_permission"
    user_id: uuid.UUID = Field(
        foreign_key="user.id", primary_key=True, ondelete="CASCADE"
    )
    permission_id: int = Field(
        foreign_key="permission.permission_id",
        primary_key=True,
        ondelete="CASCADE",
    )


# SQLAlchemy wants the Table itself for a many-to-many secondary, not the
# mapped class.
USER_PERMISSION_TABLE = SQLModel.metadata.tables[UserPermission.__tablename__]


# Database model, database table inferred from class name
class Permission(SQLModel, table=True):
    permission_id: int = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=255)
    users: list[User] = Relationship(
        back_populates="permissions",
        sa_relationship_kwargs={"secondary": USER_PERMISSION_TABLE},
    )


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    permissions: list[Permission] = Relationship(
        back_populates="users",
        sa_relationship_kwargs={"secondary": USER_PERMISSION_TABLE},
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None
    permissions: list[str] = Field(default_factory=list)

    @classmethod
    def from_user(cls, user: User) -> UserPublic:
        """Build the public view, exposing permission names rather than rows."""
        return cls(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            full_name=user.full_name,
            created_at=user.created_at,
            permissions=[permission.name for permission in user.permissions],
        )


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
