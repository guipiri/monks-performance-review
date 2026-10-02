from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    limit: int = Field(
        50, ge=1, le=100, description="Número máximo de itens retornados"
    )
    offset: int = Field(0, ge=0, description="Deslocamento para paginação")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int
