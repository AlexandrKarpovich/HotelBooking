from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers import auth_router, bookings_router, admin_router

app = FastAPI(
    title="Hotel Booking API",
    description="Система управления бронированием отелей",
    version="1.0.0"
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