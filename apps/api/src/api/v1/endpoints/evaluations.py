from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from src.api.deps import CurrentUser, DbSession
from src.schemas.evaluation import (
    EvaluationCreate,
    EvaluationResponse,
    SubordinateResponse,
)
from src.services.evaluation_service import (
    create_evaluation,
    get_evaluation_by_id,
    get_evaluations_for_user_hierarchy,
    get_hierarchy_subordinates_map,
    get_subordinates_list_with_status,
)

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("/subordinates", response_model=list[SubordinateResponse])
def list_subordinates_for_evaluation(
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Lista todos os funcionários que fazem parte da hierarquia do usuário logado
    (diretos e indiretos), informando se já foram avaliados na semana atual.
    """
    return get_subordinates_list_with_status(db, leader_id=current_user.id)


@router.post(
    "",
    response_model=EvaluationResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_evaluation(
    data: EvaluationCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Envia a avaliação de desempenho de um funcionário liderado.

    Regras aplicadas:
    - O funcionário deve pertencer à hierarquia do avaliador (direto ou indireto).
    - As respostas devem ser notas inteiras entre 1 e 4.
    - É permitida apenas uma avaliação por semana para cada par (líder, liderado).
    - Após o envio, a avaliação é imutável (não pode ser alterada).
    """
    return create_evaluation(db, evaluator_id=current_user.id, data=data)


@router.get("", response_model=list[EvaluationResponse])
def list_evaluations(
    db: DbSession,
    current_user: CurrentUser,
    evaluated_id: Optional[int] = Query(
        None, description="Filtrar por ID do funcionário avaliado"
    ),
    evaluator_id: Optional[int] = Query(
        None, description="Filtrar por ID do avaliador"
    ),
):
    """
    Lista as avaliações feitas para subordinados (diretos e indiretos) do usuário logado
    feitas por ele ou por outros líderes.
    """
    return get_evaluations_for_user_hierarchy(
        db,
        user_id=current_user.id,
        evaluated_id=evaluated_id,
        evaluator_id=evaluator_id,
    )


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation(
    evaluation_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Obtém os detalhes de uma avaliação por ID.
    """
    evaluation = get_evaluation_by_id(db, evaluation_id=evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada.",
        )

    # Permitir visualização pelo avaliador ou por qualquer líder que tenha o avaliado
    # na sua hierarquia de subordinados (diretos ou indiretos)
    subordinates_map = get_hierarchy_subordinates_map(db, leader_id=current_user.id)
    is_subordinate = evaluation.evaluated_id in subordinates_map

    if evaluation.evaluator_id != current_user.id and not is_subordinate:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para visualizar esta avaliação.",
        )

    return evaluation
