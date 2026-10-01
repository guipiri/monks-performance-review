"""create_evaluations_table

Revision ID: 876204003ffe
Revises: b5cb81c8793b
Create Date: 2026-10-01 15:09:36.058128

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "876204003ffe"
down_revision: Union[str, Sequence[str], None] = "b5cb81c8793b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Cria tabela apenas se não existir (para ser idempotente)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "evaluations" not in tables:
        op.create_table(
            "evaluations",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("evaluator_id", sa.Integer(), nullable=False),
            sa.Column("evaluated_id", sa.Integer(), nullable=False),
            sa.Column("delivery_of_results", sa.Integer(), nullable=False),
            sa.Column("execution_and_quality", sa.Integer(), nullable=False),
            sa.Column("learning_and_development", sa.Integer(), nullable=False),
            sa.Column("problem_solving", sa.Integer(), nullable=False),
            sa.Column("collaboration_and_leadership", sa.Integer(), nullable=False),
            sa.Column("strategic_vision", sa.Integer(), nullable=False),
            sa.Column("final_score", sa.Float(), nullable=False),
            sa.Column("comments", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(["evaluated_id"], ["users.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["evaluator_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_evaluations_id"), "evaluations", ["id"], unique=False)
        op.create_index(
            op.f("ix_evaluations_evaluator_id"),
            "evaluations",
            ["evaluator_id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_evaluations_evaluated_id"),
            "evaluations",
            ["evaluated_id"],
            unique=False,
        )


def downgrade() -> None:
    op.drop_index(op.f("ix_evaluations_evaluated_id"), table_name="evaluations")
    op.drop_index(op.f("ix_evaluations_evaluator_id"), table_name="evaluations")
    op.drop_index(op.f("ix_evaluations_id"), table_name="evaluations")
    op.drop_table("evaluations")
