import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

import src.models  # noqa: F401
from src.api.v1.router import api_router
from src.core.config import settings
from src.core.exceptions import DomainException
from src.db.session import SessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    # O controle de schema e migrações é gerenciado exclusivamente pelo Alembic
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configuração de CORS com origens configuráveis via Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """
    Injeta Request ID único para rastreabilidade de requisições.
    """
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.perf_counter()

    response = await call_next(request)

    process_time = time.perf_counter() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    """
    Captura exceções de domínio de negócio e as converte em respostas HTTP padronizadas.
    Mantém compatibilidade com o padrão FastAPI {"detail": "..."} e adiciona "code".
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "code": exc.code,
            "details": exc.details,
        },
    )


# Rotas da API
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["system"])
def health():
    """
    Healthcheck ativo da API com verificação de conectividade com o PostgreSQL.
    """
    db_status = "connected"
    status_code = status.HTTP_200_OK

    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ok" if db_status == "connected" else "error",
            "database": db_status,
        },
    )
