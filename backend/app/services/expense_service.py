from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models.expense import Expense
from ..models.user import User
from ..schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    def __init__(self, db: Session):
        self.db = db

    def create_expense(self, expense_data: ExpenseCreate, user_id: int):
        expense = Expense(
            **expense_data.dict(),
            user_id=user_id,
            status="pending"
        )

        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)

        return expense

    def get_user_expenses(self, user_id: int):
        return self.db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.created_at.desc()).all()

    def get_all_expenses(self):
        return self.db.query(Expense).order_by(Expense.created_at.desc()).all()

    def update_expense_status(self, expense_id: int, status: str, manager_id: int):
        expense = self.db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Заявка не найдена")

        expense.status = status
        expense.manager_id = manager_id

        self.db.commit()
        return expense

    def get_expense_stats(self):
        total_expenses = self.db.query(Expense).count()
        total_amount = self.db.query(Expense).filter(Expense.status == "approved").with_entities(
            func.sum(Expense.amount)).scalar() or 0

        status_counts = {}
        for status in ["pending", "approved", "rejected", "paid"]:
            count = self.db.query(Expense).filter(Expense.status == status).count()
            status_counts[status] = count

        categories = self.db.query(Expense.category, func.count(Expense.id)).group_by(Expense.category).all()

        return {
            "total_expenses": total_expenses,
            "total_amount": total_amount,
            "status_counts": status_counts,
            "categories": [{"name": cat[0], "count": cat[1]} for cat in categories]
        }