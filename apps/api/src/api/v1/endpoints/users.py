from fastapi import APIRouter

from src.api.deps import CurrentUser
from src.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: CurrentUser,
):
    """
    Retorna o perfil do usuário logado através do token JWT.
    """
    return current_user
