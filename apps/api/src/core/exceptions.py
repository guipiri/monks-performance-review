from typing import Any, Optional


class DomainException(Exception):
    """Exceção base de regras de negócio e domínio da aplicação."""

    def __init__(
        self,
        message: str,
        code: str = "DOMAIN_ERROR",
        status_code: int = 400,
        details: Optional[Any] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class EntityNotFoundException(DomainException):
    """Exceção quando uma entidade/recurso não é encontrada."""

    def __init__(
        self,
        message: str,
        code: str = "NOT_FOUND",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=404,
            details=details,
        )


class UserNotFoundException(EntityNotFoundException):
    def __init__(self, user_id: int):
        super().__init__(
            message=f"Funcionário com ID {user_id} não encontrado.",
            code="USER_NOT_FOUND",
        )


class EvaluationNotFoundException(EntityNotFoundException):
    def __init__(self, evaluation_id: int):
        super().__init__(
            message=f"Avaliação com ID {evaluation_id} não encontrada.",
            code="EVALUATION_NOT_FOUND",
        )


class SelfEvaluationForbiddenException(DomainException):
    def __init__(self):
        super().__init__(
            message="Não é permitido autoavaliar-se.",
            code="SELF_EVALUATION_NOT_ALLOWED",
            status_code=400,
        )


class HierarchyForbiddenException(DomainException):
    def __init__(self, message: Optional[str] = None):
        super().__init__(
            message=(
                message
                or "O funcionário selecionado não faz parte da sua hierarquia "
                "de liderança."
            ),
            code="HIERARCHY_FORBIDDEN",
            status_code=403,
        )


class DuplicateWeeklyEvaluationException(DomainException):
    def __init__(self):
        super().__init__(
            message=(
                "Você já realizou uma avaliação para este funcionário na "
                "semana atual. Só é permitida uma avaliação por semana."
            ),
            code="DUPLICATE_WEEKLY_EVALUATION",
            status_code=400,
        )


class AuthenticationFailedException(DomainException):
    def __init__(self, message: str = "E-mail ou senha incorretos."):
        super().__init__(
            message=message,
            code="INVALID_CREDENTIALS",
            status_code=401,
        )
