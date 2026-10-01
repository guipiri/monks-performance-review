from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.user import User


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    evaluator_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evaluated_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Critérios de avaliação com notas de 1 a 4
    # 1. Entrega de Resultados (Peso 25)
    delivery_of_results: Mapped[int] = mapped_column(Integer, nullable=False)
    # 2. Execução e Qualidade do Trabalho (Peso 20)
    execution_and_quality: Mapped[int] = mapped_column(Integer, nullable=False)
    # 3. Capacidade de Aprendizado e Desenvolvimento (Peso 20)
    learning_and_development: Mapped[int] = mapped_column(Integer, nullable=False)
    # 4. Resolução de Problemas e Pensamento Crítico (Peso 15)
    problem_solving: Mapped[int] = mapped_column(Integer, nullable=False)
    # 5. Colaboração, Influência e Liderança (Peso 10)
    collaboration_and_leadership: Mapped[int] = mapped_column(Integer, nullable=False)
    # 6. Visão Estratégica e Potencial de Crescimento (Peso 10)
    strategic_vision: Mapped[int] = mapped_column(Integer, nullable=False)

    # Nota final ponderada (1.00 a 4.00)
    final_score: Mapped[float] = mapped_column(Float, nullable=False)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    evaluator: Mapped["User"] = relationship("User", foreign_keys=[evaluator_id])
    evaluated: Mapped["User"] = relationship("User", foreign_keys=[evaluated_id])
