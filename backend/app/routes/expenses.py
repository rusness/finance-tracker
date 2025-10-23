from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func  # ✅ Правильный импорт func
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.expense import Expense
from ..models.user import User
from ..core.security import verify_token
from ..schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse

router = APIRouter(tags=["expenses"])


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.replace("Bearer ", "")
        payload = verify_token(token)

        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")


@router.post("/expenses")
async def create_expense(
        expense_data: ExpenseCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        print(f"📝 Создание заявки пользователем: {current_user.username}")

        expense = Expense(
            title=expense_data.title,
            description=expense_data.description,
            amount=expense_data.amount,
            currency=expense_data.currency,
            category=expense_data.category,
            user_id=current_user.id,
            status="pending"
        )

        db.add(expense)
        db.commit()
        db.refresh(expense)

        print(f"✅ Заявка создана успешно! ID: {expense.id}")

        return {
            "id": expense.id,
            "message": "Заявка создана успешно",
            "status": expense.status
        }
    except Exception as e:
        print(f"❌ Ошибка при создании заявки: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при создании заявки: {str(e)}")


@router.get("/expenses", response_model=List[ExpenseResponse])
async def get_my_expenses(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.created_at.desc()).all()

    return [
        {
            "id": expense.id,
            "title": expense.title,
            "description": expense.description,
            "amount": expense.amount,
            "currency": expense.currency,
            "category": expense.category,
            "status": expense.status,
            "created_at": expense.created_at,
            "user_name": expense.user.full_name
        }
        for expense in expenses
    ]


@router.get("/expenses/all", response_model=List[ExpenseResponse])
async def get_all_expenses(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    expenses = db.query(Expense).order_by(Expense.created_at.desc()).all()

    return [
        {
            "id": expense.id,
            "title": expense.title,
            "description": expense.description,
            "amount": expense.amount,
            "currency": expense.currency,
            "category": expense.category,
            "status": expense.status,
            "created_at": expense.created_at,
            "user_name": expense.user.full_name,
            "user_department": expense.user.department
        }
        for expense in expenses
    ]


@router.put("/expenses/{expense_id}")
async def update_expense_status(
        expense_id: int,
        update_data: ExpenseUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    expense.status = update_data.status
    expense.manager_id = current_user.id
    expense.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Статус заявки обновлен", "status": expense.status}


@router.get("/expenses/stats")
async def get_expense_stats(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    total_expenses = db.query(Expense).count()

    # ✅ Правильное использование func
    total_amount_result = db.query(func.sum(Expense.amount)).filter(Expense.status == "approved").scalar()
    total_amount = total_amount_result or 0

    status_counts = {}
    for status in ["pending", "approved", "rejected", "paid"]:
        count = db.query(Expense).filter(Expense.status == status).count()
        status_counts[status] = count

    # ✅ Правильное использование func для группировки
    categories_result = db.query(Expense.category, func.count(Expense.id)).group_by(Expense.category).all()
    categories = [{"name": cat[0], "count": cat[1]} for cat in categories_result]

    return {
        "total_expenses": total_expenses,
        "total_amount": float(total_amount),  # Конвертируем в float для JSON
        "status_counts": status_counts,
        "categories": categories
    }