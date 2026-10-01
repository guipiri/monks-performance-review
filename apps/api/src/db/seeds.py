from sqlalchemy import select, text

from src.core.security import get_password_hash
from src.db.session import SessionLocal
from src.models.leader_lead import LeaderLead
from src.models.user import User

EMPLOYEES_DATA = [
    {
        "id": 1,
        "name": "Alice Hartman",
        "email": "alice.hartman@company.com",
        "position_name": "CEO",
    },
    {
        "id": 2,
        "name": "Bob Sinclair",
        "email": "bob.sinclair@company.com",
        "position_name": "CTO",
    },
    {
        "id": 3,
        "name": "Carol Nguyen",
        "email": "carol.nguyen@company.com",
        "position_name": "CFO",
    },
    {
        "id": 4,
        "name": "David Okafor",
        "email": "david.okafor@company.com",
        "position_name": "Engineering Manager",
    },
    {
        "id": 5,
        "name": "Eva Müller",
        "email": "eva.muller@company.com",
        "position_name": "Engineering Manager",
    },
    {
        "id": 6,
        "name": "Frank Rossi",
        "email": "frank.rossi@company.com",
        "position_name": "Product Manager",
    },
    {
        "id": 7,
        "name": "Grace Kim",
        "email": "grace.kim@company.com",
        "position_name": "UX Designer",
    },
    {
        "id": 8,
        "name": "Henry Patel",
        "email": "henry.patel@company.com",
        "position_name": "Senior Software Engineer",
    },
    {
        "id": 9,
        "name": "Isabelle Dubois",
        "email": "isabelle.dubois@company.com",
        "position_name": "Senior Software Engineer",
    },
    {
        "id": 10,
        "name": "James Watanabe",
        "email": "james.watanabe@company.com",
        "position_name": "Software Engineer",
    },
    {
        "id": 11,
        "name": "Karen Oliveira",
        "email": "karen.oliveira@company.com",
        "position_name": "Software Engineer",
    },
    {
        "id": 12,
        "name": "Liam Johansson",
        "email": "liam.johansson@company.com",
        "position_name": "Software Engineer",
    },
    {
        "id": 13,
        "name": "Mia Fernandez",
        "email": "mia.fernandez@company.com",
        "position_name": "Data Engineer",
    },
    {
        "id": 14,
        "name": "Noah Chukwu",
        "email": "noah.chukwu@company.com",
        "position_name": "Data Analyst",
    },
    {
        "id": 15,
        "name": "Olivia Brooks",
        "email": "olivia.brooks@company.com",
        "position_name": "QA Engineer",
    },
    {
        "id": 16,
        "name": "Paul Nakamura",
        "email": "paul.nakamura@company.com",
        "position_name": "QA Engineer",
    },
    {
        "id": 17,
        "name": "Quinn Santos",
        "email": "quinn.santos@company.com",
        "position_name": "DevOps Engineer",
    },
    {
        "id": 18,
        "name": "Rachel Ivanova",
        "email": "rachel.ivanova@company.com",
        "position_name": "Finance Analyst",
    },
    {
        "id": 19,
        "name": "Samuel Osei",
        "email": "samuel.osei@company.com",
        "position_name": "Finance Analyst",
    },
    {
        "id": 20,
        "name": "Tina Bergmann",
        "email": "tina.bergmann@company.com",
        "position_name": "HR Specialist",
    },
]

LEADER_LEAD_RELATIONSHIPS = [
    # Alice leads top-level reports
    (1, 2),
    (1, 3),
    (1, 6),
    (1, 20),
    # Bob leads his direct reports
    (2, 4),
    (2, 5),
    (2, 7),
    (2, 17),
    (2, 16),
    # David leads his engineers
    (4, 8),
    (4, 12),
    # Henry leads junior engineers
    (8, 10),
    (8, 11),
    # Eva leads her engineers
    (5, 9),
    (5, 13),
    (5, 14),
    # Carol leads finance team
    (3, 18),
    (3, 19),
    # Frank leads QA
    (6, 15),
]

DEFAULT_PASSWORD = "password123"


def seed_database() -> None:
    db = SessionLocal()
    try:
        # Hash da senha padrão gerado uma vez para melhor desempenho
        default_hashed_password = get_password_hash(DEFAULT_PASSWORD)

        # 1. Inserir ou atualizar os usuários
        for emp in EMPLOYEES_DATA:
            stmt = select(User).where(User.id == emp["id"])
            existing_user = db.execute(stmt).scalar_one_or_none()

            if not existing_user:
                # Verifica por e-mail para evitar conflito de chave única
                stmt_email = select(User).where(User.email == emp["email"])
                existing_email_user = db.execute(stmt_email).scalar_one_or_none()

                if existing_email_user:
                    existing_email_user.name = emp["name"]
                    existing_email_user.position_name = emp["position_name"]
                    existing_email_user.hashed_password = default_hashed_password
                    print(f"  ↻ Atualizado por email: {emp['email']}")
                else:
                    new_user = User(
                        id=emp["id"],
                        name=emp["name"],
                        email=emp["email"],
                        position_name=emp["position_name"],
                        hashed_password=default_hashed_password,
                    )
                    db.add(new_user)
                    print(
                        f"  ✓ Criado: [{emp['id']}] {emp['name']} "
                        f"- {emp['position_name']}"
                    )
            else:
                existing_user.name = emp["name"]
                existing_user.email = emp["email"]
                existing_user.position_name = emp["position_name"]
                existing_user.hashed_password = default_hashed_password
                print(f"  ↻ Atualizado: [{emp['id']}] {emp['name']}")

        db.flush()

        # Ajusta a sequência do PostgreSQL para IDs auto-incrementais
        try:
            seq_sql = (
                "SELECT setval(pg_get_serial_sequence('users', 'id'), "
                "coalesce(max(id), 1)) FROM users;"
            )
            db.execute(text(seq_sql))
        except Exception:
            pass

        # 2. Inserir relacionamentos Líder -> Liderado
        for leader_id, lead_id in LEADER_LEAD_RELATIONSHIPS:
            stmt = select(LeaderLead).where(
                LeaderLead.leader_id == leader_id,
                LeaderLead.lead_id == lead_id,
            )
            existing_rel = db.execute(stmt).scalar_one_or_none()

            if not existing_rel:
                rel = LeaderLead(leader_id=leader_id, lead_id=lead_id)
                db.add(rel)
                print(f"  ✓ Líder ID {leader_id} -> Liderado ID {lead_id}")
            else:
                print(f"  - Já existe: Líder ID {leader_id} -> Liderado ID {lead_id}")

        db.commit()
        print("Seeds executados com sucesso!")
    except Exception as e:
        db.rollback()
        print(f"Erro ao rodar seeds: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
