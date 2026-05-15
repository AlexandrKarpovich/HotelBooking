from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Booking, UserRole
from ..schemas import UserResponse, BookingResponse
from ..auth import get_current_admin, get_current_manager

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer()

# ==================== Управление пользователями (только админ) ====================

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[UserRole] = Query(None, description="Фильтр по роли"),
    is_active: Optional[bool] = Query(None, description="Фильтр по статусу"),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение списка всех пользователей (только админ)"""
    current_user = get_current_admin(credentials, db)
    
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users

@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    new_role: UserRole,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Изменение роли пользователя (только админ)"""
    current_user = get_current_admin(credentials, db)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == UserRole.ADMIN and current_user.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change admin role"
        )
    
    user.role = new_role
    db.commit()
    
    return {"message": f"User role changed to {new_role.value}"}

@router.put("/users/{user_id}/block")
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Блокировка пользователя (только админ)"""
    current_user = get_current_admin(credentials, db)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot block admin user"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user.username} blocked"}

@router.put("/users/{user_id}/unblock")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Разблокировка пользователя (только админ)"""
    current_user = get_current_admin(credentials, db)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": f"User {user.username} unblocked"}

# ==================== Управление бронированиями (менеджер/админ) ====================

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None, description="Фильтр по пользователю"),
    location: Optional[str] = Query(None, description="Фильтр по локации"),
    status: Optional[str] = Query(None, description="Фильтр по статусу"),
    is_confirmed: Optional[bool] = Query(None, description="Фильтр по подтверждению"),
    date_from: Optional[datetime] = Query(None, description="Дата от"),
    date_to: Optional[datetime] = Query(None, description="Дата до"),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение всех бронирований (менеджер и админ)"""
    current_user = get_current_manager(credentials, db)
    
    query = db.query(Booking)
    
    if user_id:
        query = query.filter(Booking.user_id == user_id)
    
    if location:
        query = query.filter(Booking.location.ilike(f"%{location}%"))
    
    if status:
        query = query.filter(Booking.status == status)
    
    if is_confirmed is not None:
        query = query.filter(Booking.is_confirmed == is_confirmed)
    
    if date_from:
        query = query.filter(Booking.check_in_date >= date_from)
    
    if date_to:
        query = query.filter(Booking.check_out_date <= date_to)
    
    bookings = query.order_by(desc(Booking.created_at)).offset(skip).limit(limit).all()
    
    return bookings

@router.put("/bookings/{booking_id}/status")
def admin_change_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Изменение статуса бронирования (менеджер и админ)"""
    current_user = get_current_manager(credentials, db)
    
    valid_statuses = ["pending", "confirmed", "cancelled", "completed"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = status
    booking.is_confirmed = (status == "confirmed")
    db.commit()
    
    return {"message": f"Booking status changed to {status}"}

@router.post("/bookings/{booking_id}/admin-confirm")
def admin_confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Подтверждение бронирования от лица менеджера"""
    current_user = get_current_manager(credentials, db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.is_confirmed = True
    booking.status = "confirmed"
    db.commit()
    
    return {"message": f"Booking {booking_id} confirmed by manager"}

# ==================== Статистика ====================

@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Получение статистики по бронированиям (менеджер и админ)"""
    current_user = get_current_manager(credentials, db)
    
    total_bookings = db.query(Booking).count()
    total_users = db.query(User).count()
    
    pending_bookings = db.query(Booking).filter(Booking.status == "pending").count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "cancelled").count()
    completed_bookings = db.query(Booking).filter(Booking.status == "completed").count()
    
    total_revenue = db.query(func.sum(Booking.price_per_night)).filter(
        Booking.status.in_(["confirmed", "completed"])
    ).scalar() or 0
    
    avg_price = db.query(func.avg(Booking.price_per_night)).scalar() or 0
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_bookings = db.query(Booking).filter(
        Booking.created_at >= thirty_days_ago
    ).count()
    
    recent_revenue = db.query(func.sum(Booking.price_per_night)).filter(
        Booking.created_at >= thirty_days_ago,
        Booking.status.in_(["confirmed", "completed"])
    ).scalar() or 0
    
    top_locations = db.query(
        Booking.location,
        func.count(Booking.id).label("bookings_count")
    ).group_by(Booking.location).order_by(desc("bookings_count")).limit(5).all()
    
    top_users = db.query(
        User.username,
        func.count(Booking.id).label("bookings_count")
    ).join(Booking).group_by(User.id).order_by(desc("bookings_count")).limit(5).all()
    
    return {
        "overview": {
            "total_bookings": total_bookings,
            "total_users": total_users,
            "recent_bookings_30d": recent_bookings
        },
        "by_status": {
            "pending": pending_bookings,
            "confirmed": confirmed_bookings,
            "cancelled": cancelled_bookings,
            "completed": completed_bookings
        },
        "financial": {
            "total_revenue": float(total_revenue),
            "avg_price_per_night": float(avg_price),
            "recent_revenue_30d": float(recent_revenue)
        },
        "top_locations": [
            {"location": loc, "bookings_count": count} 
            for loc, count in top_locations
        ],
        "top_users": [
            {"username": username, "bookings_count": count} 
            for username, count in top_users
        ]
    }