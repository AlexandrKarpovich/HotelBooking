from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    MANAGER = "manager"
    ADMIN = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str

class ChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class TokenData(BaseModel):
    username: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price_per_night: float = Field(..., gt=0)
    check_in_date: datetime
    check_out_date: datetime
    guests_count: int = Field(..., ge=1, le=20)
    
    @validator('check_out_date')
    def validate_dates(cls, v, values):
        if 'check_in_date' in values and v <= values['check_in_date']:
            raise ValueError('check_out_date must be after check_in_date')
        return v

class BookingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price_per_night: Optional[float] = Field(None, gt=0)
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None
    guests_count: Optional[int] = Field(None, ge=1, le=20)

class BookingResponse(BaseModel):
    id: int
    title: str
    location: str
    description: Optional[str]
    price_per_night: float
    check_in_date: datetime
    check_out_date: datetime
    guests_count: int
    is_confirmed: bool
    status: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True