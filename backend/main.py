from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware 
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers import auth_router, bookings_router, admin_router

app = FastAPI(
    title="Hotel Booking API",
    description="Система управления бронированием отелей",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React frontend
        "http://127.0.0.1:3000",
        "http://localhost:5173",      # Vite default
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],               # Разрешить все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],               # Разрешить все заголовки
)

app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "Добро пожаловать в систему бронирования отелей"}

@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "ok",
        "service": "Hotel Booking API",
        "database": db_status
    }