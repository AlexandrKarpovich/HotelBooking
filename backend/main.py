from fastapi import FastAPI
from app.database import engine, Base
from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hotel Booking API",
    description="Система управления бронированием отелей",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Добро пожаловать в систему бронирования отелей"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Hotel Booking API",
        "database": "connected"
    }