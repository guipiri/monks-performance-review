from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models.leader_lead import LeaderLead
from src.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_ids(self, user_ids: list[int]) -> list[User]:
        if not user_ids:
            return []
        stmt = select(User).where(User.id.in_(user_ids)).order_by(User.name)
        return list(self.db.execute(stmt).scalars().all())

    def get_hierarchy_subordinates_map(self, leader_id: int) -> dict[int, bool]:
        """
        Retorna um dicionário mapeando o ID de cada liderado da hierarquia
        para um booleano indicando se é liderado direto (True) ou indireto (False).
        Utiliza Common Table Expression (CTE) recursiva.
        """
        # Liderados diretos
        direct_stmt = select(LeaderLead.lead_id).where(
            LeaderLead.leader_id == leader_id
        )
        direct_ids = set(self.db.execute(direct_stmt).scalars().all())

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
        all_subordinate_ids = set(self.db.execute(stmt).scalars().all())

        # Previne que o próprio líder conste como liderado em ciclos
        all_subordinate_ids.discard(leader_id)

        return {uid: (uid in direct_ids) for uid in all_subordinate_ids}
