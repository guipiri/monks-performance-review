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
    assert response.json() == {"status": "ok"}


def test_auth_flow(client):
    # 1. Registrar usuário
    email = "monk@example.com"
    password = "secretpassword123"
    register_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "Monk Developer", "password": password},
    )
    # Pode ser 201 ou 400 se já existir
    assert register_response.status_code in (201, 400)

    # 2. Login via JSON
    login_response = client.post(
        "/api/v1/auth/login/json",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Acessar rota protegida com Token
    me_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == email
    assert user_data["name"] == "Monk Developer"

    # 4. Falha de autenticação com senha incorreta
    invalid_login = client.post(
        "/api/v1/auth/login/json",
        json={"email": email, "password": "wrongpassword"},
    )
    assert invalid_login.status_code == 401
