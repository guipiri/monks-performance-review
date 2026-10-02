from datetime import UTC, datetime, timedelta
from typing import Optional

from src.core.exceptions import (
    DuplicateWeeklyEvaluationException,
    HierarchyForbiddenException,
    SelfEvaluationForbiddenException,
    UserNotFoundException,
)
from src.models.evaluation import Evaluation
from src.repositories.evaluation_repository import EvaluationRepository
from src.repositories.user_repository import UserRepository
from src.schemas.evaluation import CRITERIA_WEIGHTS, EvaluationCreate


class EvaluationService:
    def __init__(
        self,
        eval_repo: EvaluationRepository,
        user_repo: UserRepository,
    ):
        self.eval_repo = eval_repo
        self.user_repo = user_repo

    @staticmethod
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

    @staticmethod
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
            + data.learning_and_development
            * CRITERIA_WEIGHTS["learning_and_development"]
            + data.problem_solving * CRITERIA_WEIGHTS["problem_solving"]
            + data.collaboration_and_leadership
            * CRITERIA_WEIGHTS["collaboration_and_leadership"]
            + data.strategic_vision * CRITERIA_WEIGHTS["strategic_vision"]
        )
        return round(weighted_sum / 100.0, 2)

    def get_hierarchy_subordinates_map(self, leader_id: int) -> dict[int, bool]:
        """
        Retorna o mapa da hierarquia de subordinados para o líder especificado.
        """
        return self.user_repo.get_hierarchy_subordinates_map(leader_id=leader_id)

    def check_existing_week_evaluation(
        self, evaluator_id: int, evaluated_id: int
    ) -> Optional[Evaluation]:
        """
        Verifica se já existe avaliação enviada por este líder na semana atual.
        """
        start_of_week, end_of_week = self.get_current_week_bounds()
        return self.eval_repo.get_week_evaluation(
            evaluator_id=evaluator_id,
            evaluated_id=evaluated_id,
            start_of_week=start_of_week,
            end_of_week=end_of_week,
        )

    def create_evaluation(
        self, evaluator_id: int, data: EvaluationCreate
    ) -> Evaluation:
        """
        Cria uma nova avaliação após validar todas as regras de negócio de domínio:
        1. O avaliador não pode se autoavaliar.
        2. O subordinado deve existir no banco de dados.
        3. O subordinado deve pertencer à hierarquia do avaliador.
        4. O par líder-subordinado só pode ter uma avaliação por semana.
        """
        if data.evaluated_id == evaluator_id:
            raise SelfEvaluationForbiddenException()

        # 1. Verificar se o liderado existe
        evaluated_user = self.user_repo.get_by_id(data.evaluated_id)
        if not evaluated_user:
            raise UserNotFoundException(user_id=data.evaluated_id)

        # 2. Verificar se o liderado pertence à hierarquia do líder
        subordinates_map = self.user_repo.get_hierarchy_subordinates_map(
            leader_id=evaluator_id
        )
        if data.evaluated_id not in subordinates_map:
            raise HierarchyForbiddenException()

        # 3. Verificar se já existe avaliação enviada nesta semana
        start_of_week, end_of_week = self.get_current_week_bounds()
        existing_eval = self.eval_repo.get_week_evaluation(
            evaluator_id=evaluator_id,
            evaluated_id=data.evaluated_id,
            start_of_week=start_of_week,
            end_of_week=end_of_week,
        )
        if existing_eval:
            raise DuplicateWeeklyEvaluationException()

        # 4. Calcular nota final ponderada
        final_score = self.calculate_final_score(data)

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
        saved_evaluation = self.eval_repo.create(evaluation)

        # Retorna avaliação com joins carregados
        return (
            self.eval_repo.get_by_id(saved_evaluation.id)
            or saved_evaluation
        )

    def get_evaluation_by_id(self, evaluation_id: int) -> Optional[Evaluation]:
        """
        Busca uma avaliação por ID através do repositório.
        """
        return self.eval_repo.get_by_id(evaluation_id=evaluation_id)

    def get_evaluations_for_user_hierarchy(
        self,
        user_id: int,
        evaluated_id: Optional[int] = None,
        evaluator_id: Optional[int] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> list[Evaluation]:
        """
        Retorna avaliações feitas para os subordinados (diretos e indiretos),
        feitas por ele ou por outros líderes, além de avaliações do próprio líder.
        """
        subordinates_map = self.user_repo.get_hierarchy_subordinates_map(
            leader_id=user_id
        )
        subordinate_ids = set(subordinates_map.keys())

        return self.eval_repo.list_for_user_hierarchy(
            user_id=user_id,
            subordinate_ids=subordinate_ids,
            evaluated_id=evaluated_id,
            evaluator_id=evaluator_id,
            limit=limit,
            offset=offset,
        )

    def get_subordinates_list_with_status(self, leader_id: int) -> list[dict]:
        """
        Lista todos os liderados da hierarquia do líder com status na semana atual.
        """
        subordinates_map = self.user_repo.get_hierarchy_subordinates_map(
            leader_id=leader_id
        )
        if not subordinates_map:
            return []

        subordinate_ids = list(subordinates_map.keys())
        users = self.user_repo.get_by_ids(subordinate_ids)

        start_of_week, end_of_week = self.get_current_week_bounds()
        evals = self.eval_repo.get_evaluations_for_subordinates(
            leader_id=leader_id,
            subordinate_ids=subordinate_ids,
        )

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
                    "last_evaluation_date": (
                        last_eval.created_at if last_eval else None
                    ),
                }
            )

        return result
