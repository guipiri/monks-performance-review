from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.user import User


class LeaderLead(Base):
    __tablename__ = "leader_lead"

    leader_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    leader: Mapped["User"] = relationship("User", foreign_keys=[leader_id])
    lead: Mapped["User"] = relationship("User", foreign_keys=[lead_id])
