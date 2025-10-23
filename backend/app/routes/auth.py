from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import UserLogin, UserRegister, Token
from ..services.auth import AuthService

router = APIRouter(tags=["authentication"])

@router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(user_data)
    return auth_service.create_user_token(user)

@router.post("/auth/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.register_user(user_data)
    return {"message": "Пользователь успешно создан", "user_id": user.id}