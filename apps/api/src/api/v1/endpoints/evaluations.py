from typing import Optional

from fastapi import APIRouter, Query, status

from src.api.deps import CurrentUser, EvaluationServiceDep
from src.core.exceptions import (
    EvaluationNotFoundException,
    HierarchyForbiddenException,
)
from src.schemas.evaluation import (
    EvaluationCreate,
    EvaluationResponse,
    SubordinateResponse,
)

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("/subordinates", response_model=list[SubordinateResponse])
def list_subordinates_for_evaluation(
    service: EvaluationServiceDep,
    current_user: CurrentUser,
):
    """
    Lista todos os funcionários que fazem parte da hierarquia do usuário logado
    (diretos e indiretos), informando se já foram avaliados na semana atual.
    """
    return service.get_subordinates_list_with_status(leader_id=current_user.id)


@router.post(
    "",
    response_model=EvaluationResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_evaluation(
    data: EvaluationCreate,
    service: EvaluationServiceDep,
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
    return service.create_evaluation(evaluator_id=current_user.id, data=data)


@router.get("", response_model=list[EvaluationResponse])
def list_evaluations(
    service: EvaluationServiceDep,
    current_user: CurrentUser,
    evaluated_id: Optional[int] = Query(
        None, description="Filtrar por ID do funcionário avaliado"
    ),
    evaluator_id: Optional[int] = Query(
        None, description="Filtrar por ID do avaliador"
    ),
    limit: Optional[int] = Query(
        None, ge=1, le=100, description="Número máximo de avaliações a retornar"
    ),
    offset: Optional[int] = Query(
        None, ge=0, description="Deslocamento para paginação de avaliações"
    ),
):
    """
    Lista as avaliações feitas para subordinados (diretos e indiretos) do usuário logado
    feitas por ele ou por outros líderes.
    """
    return service.get_evaluations_for_user_hierarchy(
        user_id=current_user.id,
        evaluated_id=evaluated_id,
        evaluator_id=evaluator_id,
        limit=limit,
        offset=offset,
    )


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation(
    evaluation_id: int,
    service: EvaluationServiceDep,
    current_user: CurrentUser,
):
    """
    Obtém os detalhes de uma avaliação por ID.
    """
    evaluation = service.get_evaluation_by_id(evaluation_id=evaluation_id)
    if not evaluation:
        raise EvaluationNotFoundException(evaluation_id=evaluation_id)

    # Permitir visualização pelo avaliador ou por qualquer líder que tenha o avaliado
    # na sua hierarquia de subordinados (diretos ou indiretos)
    subordinates_map = service.get_hierarchy_subordinates_map(
        leader_id=current_user.id
    )
    is_subordinate = evaluation.evaluated_id in subordinates_map

    if evaluation.evaluator_id != current_user.id and not is_subordinate:
        raise HierarchyForbiddenException(
            message="Você não tem permissão para visualizar esta avaliação."
        )

    return evaluation
