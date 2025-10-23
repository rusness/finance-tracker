from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExpenseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    category: str
    currency: str = "RUB"

class ExpenseUpdate(BaseModel):
    status: str

class ExpenseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    amount: float
    currency: str
    category: str
    status: str
    created_at: datetime
    user_name: str
    user_department: Optional[str] = None