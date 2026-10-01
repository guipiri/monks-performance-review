from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

CRITERIA_WEIGHTS = {
    "delivery_of_results": 25,
    "execution_and_quality": 20,
    "learning_and_development": 20,
    "problem_solving": 15,
    "collaboration_and_leadership": 10,
    "strategic_vision": 10,
}


class EvaluationCreate(BaseModel):
    evaluated_id: int = Field(
        ...,
        description="ID do funcionário na hierarquia a ser avaliado",
        examples=[4],
    )
    delivery_of_results: int = Field(
        ...,
        ge=1,
        le=4,
        description="Entrega de Resultados (nota 1 a 4, peso 25)",
        examples=[4],
    )
    execution_and_quality: int = Field(
        ...,
        ge=1,
        le=4,
        description="Execução e Qualidade do Trabalho (nota 1 a 4, peso 20)",
        examples=[3],
    )
    learning_and_development: int = Field(
        ...,
        ge=1,
        le=4,
        description="Capacidade de Aprendizado e Desenvolvimento (nota 1 a 4, peso 20)",
        examples=[4],
    )
    problem_solving: int = Field(
        ...,
        ge=1,
        le=4,
        description="Resolução de Problemas e Pensamento Crítico (nota 1 a 4, peso 15)",
        examples=[3],
    )
    collaboration_and_leadership: int = Field(
        ...,
        ge=1,
        le=4,
        description="Colaboração, Influência e Liderança (nota 1 a 4, peso 10)",
        examples=[4],
    )
    strategic_vision: int = Field(
        ...,
        ge=1,
        le=4,
        description="Visão Estratégica e Potencial (nota 1 a 4, peso 10)",
        examples=[3],
    )
    comments: Optional[str] = Field(
        None,
        max_length=2000,
        description="Feedback qualitativo opcional para o liderado",
        examples=["Excelente desempenho nas entregas do trimestre."],
    )


class UserSummary(BaseModel):
    id: int
    name: str
    email: str
    position_name: str

    model_config = ConfigDict(from_attributes=True)


class EvaluationResponse(BaseModel):
    id: int
    evaluator_id: int
    evaluated_id: int
    delivery_of_results: int
    execution_and_quality: int
    learning_and_development: int
    problem_solving: int
    collaboration_and_leadership: int
    strategic_vision: int
    final_score: float
    comments: Optional[str] = None
    created_at: datetime

    evaluator: Optional[UserSummary] = None
    evaluated: Optional[UserSummary] = None

    model_config = ConfigDict(from_attributes=True)


class SubordinateResponse(BaseModel):
    id: int
    name: str
    email: str
    position_name: str
    is_direct: bool
    already_evaluated_this_week: bool
    last_evaluation_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
