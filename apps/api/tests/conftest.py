import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from src.db.session import SessionLocal
from src.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def clean_evaluations_db():
    """
    Limpa avaliações de teste para garantir isolamento e determinismo.
    """
    with SessionLocal() as db:
        db.execute(text("DELETE FROM evaluations WHERE evaluator_id IN (4, 8, 12)"))
        db.commit()
    yield
    with SessionLocal() as db:
        db.execute(text("DELETE FROM evaluations WHERE evaluator_id IN (4, 8, 12)"))
        db.commit()
