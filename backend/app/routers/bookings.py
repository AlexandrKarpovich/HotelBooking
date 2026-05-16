from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models import User, Booking
from ..schemas import BookingCreate, BookingUpdate, BookingResponse
from ..auth import get_current_user, get_current_manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])
security = HTTPBearer()

@router.get("/recommendations", response_model=List[dict])
def get_recommendations(
    limit: int = Query(5, ge=1, le=20, description="Количество рекомендаций"),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение персональных рекомендаций на основе просмотров"""
    from ..utils import RecommendationEngine
    
    current_user = get_current_user(credentials, db)
    
    recommender = RecommendationEngine(db)
    recommendations = recommender.get_recommendations_for_user(
        current_user.id, 
        limit=limit
    )
    
    return recommendations


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Создание нового бронирования"""
    current_user = get_current_user(credentials, db)
    
    if booking_data.check_in_date >= booking_data.check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="check_out_date must be after check_in_date"
        )
    
    db_booking = Booking(
        **booking_data.dict(),
        user_id=current_user.id,
        status="pending",
        is_confirmed=False
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    return db_booking

@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    location: Optional[str] = Query(None, description="Фильтр по локации"),
    min_price: Optional[float] = Query(None, ge=0, description="Минимальная цена"),
    max_price: Optional[float] = Query(None, ge=0, description="Максимальная цена"),
    check_in_from: Optional[datetime] = Query(None, description="Дата заезда от"),
    check_in_to: Optional[datetime] = Query(None, description="Дата заезда до"),
    status_filter: Optional[str] = Query(None, description="Статус бронирования"),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение списка бронирований текущего пользователя с пагинацией и фильтрацией"""
    current_user = get_current_user(credentials, db)
    
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    
    if location:
        query = query.filter(Booking.location.ilike(f"%{location}%"))
    
    if min_price:
        query = query.filter(Booking.price_per_night >= min_price)
    
    if max_price:
        query = query.filter(Booking.price_per_night <= max_price)
    
    if check_in_from:
        query = query.filter(Booking.check_in_date >= check_in_from)
    
    if check_in_to:
        query = query.filter(Booking.check_in_date <= check_in_to)
    
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    
    bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    
    return bookings

@router.post("/{booking_id}/view")
def track_booking_view(
    booking_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Трекинг просмотра бронирования (для рекомендаций)"""
    from ..utils import RecommendationEngine
    
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    recommender = RecommendationEngine(db)
    recommender.track_view(current_user.id, booking_id)
    
    return {"message": "View tracked successfully"}

@router.get("/{booking_id}/similar", response_model=List[dict])
def get_similar_bookings(
    booking_id: int,
    limit: int = Query(5, ge=1, le=20, description="Количество похожих предложений"),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение похожих бронирований (альтернативы)"""
    from ..utils import RecommendationEngine
    
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    recommender = RecommendationEngine(db)
    similar = recommender.get_similar_bookings(booking_id, limit=limit)
    
    return similar

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение деталей конкретного бронирования"""
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id and current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return booking

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Обновление бронирования"""
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own bookings"
        )
    
    if booking.is_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit confirmed booking"
        )
    
    update_data = booking_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    
    return booking

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Удаление бронирования"""
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own bookings"
        )
    
    if booking.is_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete confirmed booking"
        )
    
    db.delete(booking)
    db.commit()

@router.post("/{booking_id}/confirm")
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Подтверждение бронирования пользователем"""
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only confirm your own bookings"
        )
    
    if booking.is_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking already confirmed"
        )
    
    booking.is_confirmed = True
    booking.status = "confirmed"
    db.commit()
    
    return {"message": "Booking confirmed successfully"}

@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Отмена бронирования"""
    current_user = get_current_user(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings"
        )
    
    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking already cancelled"
        )
    
    booking.status = "cancelled"
    booking.is_confirmed = False
    db.commit()
    
    return {"message": "Booking cancelled successfully"}