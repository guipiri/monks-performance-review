from src.core.security import create_access_token


def get_token_for_user_id(user_id: int) -> str:
    return create_access_token(subject=user_id)


def test_list_subordinates_hierarchy(client):
    """Testa se o líder enxerga liderados diretos e indiretos"""
    # David (ID: 4) lidera Henry (8), Liam (12), James (10), Karen (11)
    token = get_token_for_user_id(4)
    response = client.get(
        "/api/v1/evaluations/subordinates",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    subordinates = response.json()
    subordinate_ids = {s["id"] for s in subordinates}

    # Deve conter liderados diretos e indiretos
    assert 8 in subordinate_ids  # Henry (direto)
    assert 12 in subordinate_ids  # Liam (direto)
    assert 10 in subordinate_ids  # James (indireto via Henry)
    assert 11 in subordinate_ids  # Karen (indireto via Henry)

    # Não deve conter Bob (ID: 2, seu líder) nem Alice (ID: 1)
    assert 2 not in subordinate_ids
    assert 1 not in subordinate_ids


def test_evaluate_direct_and_indirect_subordinates(client):
    """Testa avaliação com cálculo de média ponderada"""
    # David (ID: 4) avaliando Henry (ID: 8 - direto)
    david_token = get_token_for_user_id(4)
    payload_henry = {
        "evaluated_id": 8,
        "delivery_of_results": 4,  # 4 * 25 = 100
        "execution_and_quality": 3,  # 3 * 20 = 60
        "learning_and_development": 4,  # 4 * 20 = 80
        "problem_solving": 3,  # 3 * 15 = 45
        "collaboration_and_leadership": 4,  # 4 * 10 = 40
        "strategic_vision": 3,  # 3 * 10 = 30
        "comments": "Excelente liderança técnica e entrega pontual.",
    }
    # Total = (100 + 60 + 80 + 45 + 40 + 30) / 100 = 355 / 100 = 3.55

    res_direct = client.post(
        "/api/v1/evaluations",
        json=payload_henry,
        headers={"Authorization": f"Bearer {david_token}"},
    )
    assert res_direct.status_code == 201
    data = res_direct.json()
    assert data["final_score"] == 3.55
    assert data["evaluated_id"] == 8
    assert data["evaluator_id"] == 4

    # David (ID: 4) avaliando James (ID: 10 - liderado indireto de Henry)
    payload_james = {
        "evaluated_id": 10,
        "delivery_of_results": 4,
        "execution_and_quality": 4,
        "learning_and_development": 4,
        "problem_solving": 4,
        "collaboration_and_leadership": 4,
        "strategic_vision": 4,
        "comments": "Performance impecável.",
    }
    res_indirect = client.post(
        "/api/v1/evaluations",
        json=payload_james,
        headers={"Authorization": f"Bearer {david_token}"},
    )
    assert res_indirect.status_code == 201
    data_indirect = res_indirect.json()
    assert data_indirect["final_score"] == 4.0


def test_cannot_evaluate_twice_in_same_week_for_same_pair(client):
    """Testa regra de limite de 1 avaliação por semana para o mesmo par"""
    henry_token = get_token_for_user_id(8)
    payload = {
        "evaluated_id": 11,
        "delivery_of_results": 3,
        "execution_and_quality": 3,
        "learning_and_development": 3,
        "problem_solving": 3,
        "collaboration_and_leadership": 3,
        "strategic_vision": 3,
    }

    # Primeira avaliação
    res1 = client.post(
        "/api/v1/evaluations",
        json=payload,
        headers={"Authorization": f"Bearer {henry_token}"},
    )
    assert res1.status_code == 201

    # Segunda tentativa no mesmo período
    res2 = client.post(
        "/api/v1/evaluations",
        json=payload,
        headers={"Authorization": f"Bearer {henry_token}"},
    )
    assert res2.status_code == 400
    assert "semana atual" in res2.json()["detail"].lower()


def test_both_leader_and_higher_leader_can_evaluate_same_subordinate(client):
    """
    Testa se um líder superior pode avaliar mesmo que o direto já tenha avaliado.
    """
    henry_token = get_token_for_user_id(8)
    david_token = get_token_for_user_id(4)

    payload_henry = {
        "evaluated_id": 11,
        "delivery_of_results": 3,
        "execution_and_quality": 3,
        "learning_and_development": 3,
        "problem_solving": 3,
        "collaboration_and_leadership": 3,
        "strategic_vision": 3,
    }
    res_henry = client.post(
        "/api/v1/evaluations",
        json=payload_henry,
        headers={"Authorization": f"Bearer {henry_token}"},
    )
    assert res_henry.status_code == 201

    payload_david = {
        "evaluated_id": 11,
        "delivery_of_results": 4,
        "execution_and_quality": 4,
        "learning_and_development": 3,
        "problem_solving": 3,
        "collaboration_and_leadership": 4,
        "strategic_vision": 3,
    }
    res_david = client.post(
        "/api/v1/evaluations",
        json=payload_david,
        headers={"Authorization": f"Bearer {david_token}"},
    )
    assert res_david.status_code == 201


def test_cannot_evaluate_non_hierarchy_user(client):
    """Testa rejeição de avaliação fora da hierarquia (403 Forbidden)"""
    henry_token = get_token_for_user_id(8)
    payload = {
        "evaluated_id": 3,  # Carol (CFO - fora da hierarquia de Henry)
        "delivery_of_results": 3,
        "execution_and_quality": 3,
        "learning_and_development": 3,
        "problem_solving": 3,
        "collaboration_and_leadership": 3,
        "strategic_vision": 3,
    }
    response = client.post(
        "/api/v1/evaluations",
        json=payload,
        headers={"Authorization": f"Bearer {henry_token}"},
    )
    assert response.status_code == 403
    assert "não faz parte da sua hierarquia" in response.json()["detail"]


def test_cannot_self_evaluate(client):
    """Testa rejeição de autoavaliação (400 Bad Request)"""
    henry_token = get_token_for_user_id(8)
    payload = {
        "evaluated_id": 8,  # Henry autoavaliando-se
        "delivery_of_results": 4,
        "execution_and_quality": 4,
        "learning_and_development": 4,
        "problem_solving": 4,
        "collaboration_and_leadership": 4,
        "strategic_vision": 4,
    }
    response = client.post(
        "/api/v1/evaluations",
        json=payload,
        headers={"Authorization": f"Bearer {henry_token}"},
    )
    assert response.status_code == 400
    assert "autoavaliar" in response.json()["detail"].lower()


def test_invalid_score_validation(client):
    """Testa validação de nota fora do intervalo 1 a 4 (422)"""
    henry_token = get_token_for_user_id(8)
    payload = {
        "evaluated_id": 10,
        "delivery_of_results": 5,  # Nota inválida (> 4)
        "execution_and_quality": 3,
        "learning_and_development": 3,
        "problem_solving": 3,
        "collaboration_and_leadership": 3,
        "strategic_vision": 3,
    }
    response = client.post(
        "/api/v1/evaluations",
        json=payload,
        headers={"Authorization": f"Bearer {henry_token}"},
    )
    assert response.status_code == 422
