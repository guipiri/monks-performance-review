from datetime import datetime
from typing import Optional

from sqlalchemy import desc, select
from sqlalchemy.orm import Session, joinedload

from src.models.evaluation import Evaluation


class EvaluationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, evaluation_id: int) -> Optional[Evaluation]:
        """
        Busca uma avaliação por ID com joins de eager loading nos relacionamentos.
        """
        stmt = (
            select(Evaluation)
            .options(
                joinedload(Evaluation.evaluator),
                joinedload(Evaluation.evaluated),
            )
            .where(Evaluation.id == evaluation_id)
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_week_evaluation(
        self,
        evaluator_id: int,
        evaluated_id: int,
        start_of_week: datetime,
        end_of_week: datetime,
    ) -> Optional[Evaluation]:
        """
        Verifica se já existe avaliação enviada por este líder na semana informada.
        """
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
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, evaluation: Evaluation) -> Evaluation:
        """
        Persiste uma nova avaliação no banco de dados.
        """
        self.db.add(evaluation)
        self.db.commit()
        self.db.refresh(evaluation)
        return evaluation

    def list_for_user_hierarchy(
        self,
        user_id: int,
        subordinate_ids: set[int],
        evaluated_id: Optional[int] = None,
        evaluator_id: Optional[int] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> list[Evaluation]:
        """
        Lista todas as avaliações visíveis para a hierarquia do usuário:
        - Avaliações feitas para qualquer liderado (direto ou indireto)
        - Avaliações feitas pelo próprio usuário
        """
        stmt = select(Evaluation).options(
            joinedload(Evaluation.evaluator),
            joinedload(Evaluation.evaluated),
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

        if offset is not None:
            stmt = stmt.offset(offset)
        if limit is not None:
            stmt = stmt.limit(limit)

        return list(self.db.execute(stmt).scalars().all())

    def get_evaluations_for_subordinates(
        self,
        leader_id: int,
        subordinate_ids: list[int],
    ) -> list[Evaluation]:
        """
        Busca avaliações feitas por um líder para uma lista de liderados.
        """
        if not subordinate_ids:
            return []

        stmt = (
            select(Evaluation)
            .where(
                Evaluation.evaluator_id == leader_id,
                Evaluation.evaluated_id.in_(subordinate_ids),
            )
            .order_by(desc(Evaluation.created_at))
        )
        return list(self.db.execute(stmt).scalars().all())
