from datetime import UTC, datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, joinedload

from src.models.evaluation import Evaluation
from src.models.leader_lead import LeaderLead
from src.models.user import User
from src.schemas.evaluation import CRITERIA_WEIGHTS, EvaluationCreate


def get_current_week_bounds(
    ref_date: Optional[datetime] = None,
) -> tuple[datetime, datetime]:
    """
    Retorna o início (segunda-feira 00:00:00 UTC) e o fim (próxima segunda-feira)
    da semana civil correspondente à data informada (ou data atual em UTC).
    """
    now = ref_date or datetime.now(UTC)
    start_of_week = (now - timedelta(days=now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    end_of_week = start_of_week + timedelta(days=7)
    return start_of_week, end_of_week


def calculate_final_score(data: EvaluationCreate) -> float:
    """
    Calcula a média ponderada das respostas com base nos pesos definidos:
    - Entrega de Resultados: 25%
    - Execução e Qualidade do Trabalho: 20%
    - Capacidade de Aprendizado e Desenvolvimento: 20%
    - Resolução de Problemas e Pensamento Crítico: 15%
    - Colaboração, Influência e Liderança: 10%
    - Visão Estratégica e Potencial de Crescimento: 10%
    Total de pesos: 100
    """
    weighted_sum = (
        data.delivery_of_results * CRITERIA_WEIGHTS["delivery_of_results"]
        + data.execution_and_quality * CRITERIA_WEIGHTS["execution_and_quality"]
        + data.learning_and_development * CRITERIA_WEIGHTS["learning_and_development"]
        + data.problem_solving * CRITERIA_WEIGHTS["problem_solving"]
        + data.collaboration_and_leadership
        * CRITERIA_WEIGHTS["collaboration_and_leadership"]
        + data.strategic_vision * CRITERIA_WEIGHTS["strategic_vision"]
    )
    return round(weighted_sum / 100.0, 2)


def get_hierarchy_subordinates_map(db: Session, leader_id: int) -> dict[int, bool]:
    """
    Retorna um dicionário mapeando o ID de cada liderado da hierarquia
    para um booleano indicando se é liderado direto (`True`) ou indireto (`False`).
    Utiliza Common Table Expression (CTE) recursiva para navegar na hierarquia.
    """
    # Liderados diretos
    direct_stmt = select(LeaderLead.lead_id).where(LeaderLead.leader_id == leader_id)
    direct_ids = set(db.execute(direct_stmt).scalars().all())

    # Toda a árvore hierárquica recursiva
    subordinates_cte = (
        select(LeaderLead.lead_id)
        .where(LeaderLead.leader_id == leader_id)
        .cte(name="subordinates_hierarchy", recursive=True)
    )

    subordinates_cte = subordinates_cte.union(
        select(LeaderLead.lead_id).join(
            subordinates_cte,
            LeaderLead.leader_id == subordinates_cte.c.lead_id,
        )
    )

    stmt = select(subordinates_cte.c.lead_id)
    all_subordinate_ids = set(db.execute(stmt).scalars().all())

    # Previne que o próprio líder conste como liderado em ciclos
    all_subordinate_ids.discard(leader_id)

    return {uid: (uid in direct_ids) for uid in all_subordinate_ids}


def check_existing_week_evaluation(
    db: Session, evaluator_id: int, evaluated_id: int
) -> Optional[Evaluation]:
    """
    Verifica se já existe avaliação enviada por este líder na semana atual.
    """
    start_of_week, end_of_week = get_current_week_bounds()
    stmt = (
        select(Evaluation)
        .where(
            Evaluation.evaluator_id == evaluator_id,
            Evaluation.evaluated_id == evaluated_id,
            Evaluation.created_at >= start_of_week,
            Evaluation.created_at < end_of_week,
        )
        .order_by(desc(Evaluation.created_at))
    )
    return db.execute(stmt).scalar_one_or_none()


def create_evaluation(
    db: Session, evaluator_id: int, data: EvaluationCreate
) -> Evaluation:
    """
    Cria uma nova avaliação após validar todas as regras de negócio:
    1. O avaliador não pode se autoavaliar.
    2. O subordinado deve existir no banco de dados.
    3. O subordinado deve pertencer à hierarquia do avaliador.
    4. O par líder-subordinado só pode ter uma avaliação por semana.
    5. As respostas não podem ser alteradas após o envio.
    """
    if data.evaluated_id == evaluator_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é permitido autoavaliar-se.",
        )

    # 1. Verificar se o liderado existe
    evaluated_user = db.execute(
        select(User).where(User.id == data.evaluated_id)
    ).scalar_one_or_none()

    if not evaluated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funcionário com ID {data.evaluated_id} não encontrado.",
        )

    # 2. Verificar se o liderado pertence à hierarquia do líder
    subordinates_map = get_hierarchy_subordinates_map(db, leader_id=evaluator_id)
    if data.evaluated_id not in subordinates_map:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "O funcionário selecionado não faz parte da "
                "sua hierarquia de liderança."
            ),
        )

    # 3. Verificar se já existe avaliação enviada nesta semana
    existing_eval = check_existing_week_evaluation(
        db, evaluator_id=evaluator_id, evaluated_id=data.evaluated_id
    )
    if existing_eval:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Você já realizou uma avaliação para este funcionário na "
                "semana atual. Só é permitida uma avaliação por semana."
            ),
        )

    # 4. Calcular nota final ponderada
    final_score = calculate_final_score(data)

    # 5. Persistir avaliação
    evaluation = Evaluation(
        evaluator_id=evaluator_id,
        evaluated_id=data.evaluated_id,
        delivery_of_results=data.delivery_of_results,
        execution_and_quality=data.execution_and_quality,
        learning_and_development=data.learning_and_development,
        problem_solving=data.problem_solving,
        collaboration_and_leadership=data.collaboration_and_leadership,
        strategic_vision=data.strategic_vision,
        final_score=final_score,
        comments=data.comments,
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    # Carregar relacionamentos para a resposta
    return get_evaluation_by_id(db, evaluation.id)  # type: ignore[return-value]


def get_evaluation_by_id(db: Session, evaluation_id: int) -> Optional[Evaluation]:
    """
    Busca uma avaliação por ID com joins nos usuários avaliador e avaliado.
    """
    stmt = (
        select(Evaluation)
        .options(
            joinedload(Evaluation.evaluator),
            joinedload(Evaluation.evaluated),
        )
        .where(Evaluation.id == evaluation_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def get_evaluations_for_user_hierarchy(
    db: Session,
    user_id: int,
    evaluated_id: Optional[int] = None,
    evaluator_id: Optional[int] = None,
) -> list[Evaluation]:
    """
    Retorna todas as avaliações feitas para os subordinados (diretos e indiretos) do usuário,
    feitas por ele ou por outros líderes, além de avaliações onde o próprio usuário foi avaliador.
    """
    subordinates_map = get_hierarchy_subordinates_map(db, leader_id=user_id)
    subordinate_ids = set(subordinates_map.keys())

    stmt = (
        select(Evaluation)
        .options(
            joinedload(Evaluation.evaluator),
            joinedload(Evaluation.evaluated),
        )
    )

    if subordinate_ids:
        condition = (Evaluation.evaluated_id.in_(subordinate_ids)) | (
            Evaluation.evaluator_id == user_id
        )
    else:
        condition = Evaluation.evaluator_id == user_id

    stmt = stmt.where(condition)

    if evaluated_id:
        stmt = stmt.where(Evaluation.evaluated_id == evaluated_id)
    if evaluator_id:
        stmt = stmt.where(Evaluation.evaluator_id == evaluator_id)

    stmt = stmt.order_by(desc(Evaluation.created_at))
    return list(db.execute(stmt).scalars().all())


def get_evaluations_by_leader(
    db: Session, leader_id: int, evaluated_id: Optional[int] = None
) -> list[Evaluation]:
    """
    Lista as avaliações feitas por um líder.
    """
    return get_evaluations_for_user_hierarchy(
        db, user_id=leader_id, evaluated_id=evaluated_id
    )


def get_subordinates_list_with_status(db: Session, leader_id: int) -> list[dict]:
    """
    Lista todos os liderados da hierarquia do líder com status na semana atual.
    """
    subordinates_map = get_hierarchy_subordinates_map(db, leader_id=leader_id)
    if not subordinates_map:
        return []

    subordinate_ids = list(subordinates_map.keys())
    users_stmt = select(User).where(User.id.in_(subordinate_ids)).order_by(User.name)
    users = db.execute(users_stmt).scalars().all()

    start_of_week, end_of_week = get_current_week_bounds()

    # Buscar as avaliações deste líder para os liderados
    evals_stmt = (
        select(Evaluation)
        .where(
            Evaluation.evaluator_id == leader_id,
            Evaluation.evaluated_id.in_(subordinate_ids),
        )
        .order_by(desc(Evaluation.created_at))
    )
    evals = db.execute(evals_stmt).scalars().all()

    # Mapear última avaliação e se foi feita na semana atual
    last_eval_map: dict[int, Evaluation] = {}
    evaluated_this_week_set: set[int] = set()

    for eval_item in evals:
        if eval_item.evaluated_id not in last_eval_map:
            last_eval_map[eval_item.evaluated_id] = eval_item
        if start_of_week <= eval_item.created_at < end_of_week:
            evaluated_this_week_set.add(eval_item.evaluated_id)

    result = []
    for u in users:
        last_eval = last_eval_map.get(u.id)
        result.append(
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "position_name": u.position_name,
                "is_direct": subordinates_map.get(u.id, False),
                "already_evaluated_this_week": u.id in evaluated_this_week_set,
                "last_evaluation_date": last_eval.created_at if last_eval else None,
            }
        )

    return result
