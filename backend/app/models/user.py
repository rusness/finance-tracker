from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="employee")
    department = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Отношение для расходов, где пользователь является владельцем
    expenses = relationship(
        "Expense",
        foreign_keys="Expense.user_id",
        back_populates="user"
    )

    # Отношение для расходов, где пользователь является менеджером
    managed_expenses = relationship(
        "Expense",
        foreign_keys="Expense.manager_id",
        back_populates="manager"
    )