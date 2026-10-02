from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.core.config import settings
from src.db.session import SessionLocal
from src.models.user import User
from src.repositories.evaluation_repository import EvaluationRepository
from src.repositories.user_repository import UserRepository
from src.schemas.token import TokenPayload
from src.services.evaluation_service import EvaluationService
from src.services.user_service import UserService

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


# Repositories
def get_user_repository(db: DbSession) -> UserRepository:
    return UserRepository(db)


def get_evaluation_repository(db: DbSession) -> EvaluationRepository:
    return EvaluationRepository(db)


UserRepositoryDep = Annotated[UserRepository, Depends(get_user_repository)]
EvaluationRepositoryDep = Annotated[
    EvaluationRepository, Depends(get_evaluation_repository)
]


# Services
def get_user_service(user_repo: UserRepositoryDep) -> UserService:
    return UserService(user_repo=user_repo)


def get_evaluation_service(
    eval_repo: EvaluationRepositoryDep,
    user_repo: UserRepositoryDep,
) -> EvaluationService:
    return EvaluationService(eval_repo=eval_repo, user_repo=user_repo)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]
EvaluationServiceDep = Annotated[
    EvaluationService, Depends(get_evaluation_service)
]


def get_current_user(
    token: TokenDep,
    user_service: UserServiceDep,
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not token_data.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = user_service.get_user_by_id(user_id=int(token_data.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
