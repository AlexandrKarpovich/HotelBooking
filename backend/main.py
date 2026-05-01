from fastapi import FastAPI

app = FastAPI(title="Hotel Booking API")

@app.get("/")
def root():
    return {"message": "Добро пожаловать в систему бронирования отелей"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "Hotel Booking API"}