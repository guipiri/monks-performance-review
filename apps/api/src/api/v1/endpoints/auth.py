from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from src.api.deps import UserServiceDep
from src.core.security import create_access_token
from src.schemas.token import Token
from src.schemas.user import UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_service: UserServiceDep,
):
    """
    Login padrão OAuth2 (compatível com Swagger /docs).
    O campo `username` deve ser preenchido com o e-mail.
    """
    user = user_service.authenticate_user(
        email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login/json", response_model=Token)
def login_json(
    credentials: UserLogin,
    user_service: UserServiceDep,
):
    """
    Login via payload JSON ({ "email": "...", "password": "..." }).
    """
    user = user_service.authenticate_user(
        email=credentials.email, password=credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")
