from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, expenses, users
from .create_admin import create_admin_user


# Create tables
Base.metadata.create_all(bind=engine)
create_admin_user()

app = FastAPI(
    title="Finance Tracker API",
    description="Система учета заявок на расход денежных средств ООО «Си Эл Инжиниринг и Ко»",
    version="1.0.0"
)

# CORS - разрешаем все origins для разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Finance Tracker API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)