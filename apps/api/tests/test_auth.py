import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"


def test_auth_flow(client):
    # 1. Login com usuário padrão existente nos seeds
    email = "alice.hartman@company.com"
    password = "password123"

    login_response = client.post(
        "/api/v1/auth/login/json",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 2. Acessar rota protegida com Token
    me_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == email
    assert user_data["name"] == "Alice Hartman"

    # 3. Falha de autenticação com senha incorreta
    invalid_login = client.post(
        "/api/v1/auth/login/json",
        json={"email": email, "password": "wrongpassword"},
    )
    assert invalid_login.status_code == 401
