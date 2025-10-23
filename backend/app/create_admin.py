from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    db = SessionLocal()
    try:
        # Проверяем, существует ли уже админ
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin_user = User(
                username="admin",
                email="admin@company.com",
                full_name="Администратор Системы",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                department="IT"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Администратор создан: admin / admin123")
        else:
            print("ℹ️ Администратор уже существует")
    except Exception as e:
        print(f"❌ Ошибка создания админа: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()