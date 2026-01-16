from pydantic import BaseModel, Field , EmailStr, field_validator,ConfigDict
from typing import Optional
from datetime import date,datetime

from models import UserRole,LeaveStatus


class UserCreate(BaseModel):
    name: str =Field(min_length=2,max_length=20)
    email: EmailStr
    password: str =Field(min_length=6,max_length=50)
    role:UserRole

class UserRegisterWithRole(BaseModel):
    name: str = Field(min_length=2, max_length=20)
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)
    role: UserRole


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):       #login 
    email: EmailStr
    password: str


class LeaveTypeCreate(BaseModel):       #leave(Admin)
    name: str = Field(min_length=2)
    max_leaves_per_year: int = Field(gt=0)


class LeaveTypeResponse(BaseModel):
    id: int
    name: str
    max_leaves_per_year: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HolidayCreate(BaseModel):         #holiday(Admin)
    date: date
    name: str = Field(min_length=3)


class HolidayResponse(BaseModel):
    id: int
    date: date
    name: str
    created_at: datetime

    model_config=ConfigDict(from_attributes=True)


class LeaveRequestCreate(BaseModel):     #leave
    leave_type_id: int
    start_date: date
    end_date: date
    reason: str = Field(min_length=5,max_length=100)

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, end_date, info):
        start_date = info.data.get("start_date")
        if start_date and end_date < start_date:
            raise ValueError("End date cannot be before start date")
        return end_date


class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    start_date: date
    end_date: date
    reason: str
    status: LeaveStatus
    manager_remark: Optional[str]
    created_at: datetime

    model_config=ConfigDict(from_attributes=True)


class LeaveApproveRequest(BaseModel):   #manager
    pass

class LeaveRejectRequest(BaseModel):
    manager_remark: str = Field(min_length=5, max_length=200)


