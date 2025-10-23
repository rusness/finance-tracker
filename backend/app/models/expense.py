from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="RUB")
    category = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")
    user_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Явно указываем foreign_keys для каждого отношения
    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="expenses"
    )

    manager = relationship(
        "User",
        foreign_keys=[manager_id],
        back_populates="managed_expenses"
    )