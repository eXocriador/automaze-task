from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, Integer, String, Text, func

from .db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, nullable=False, default=False, index=True)
    priority = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("priority BETWEEN 1 AND 10", name="priority_between_1_and_10"),
    )
