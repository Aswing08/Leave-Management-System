from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import LeaveType, Holiday,User,LeaveBalance,UserRole,LeaveRequest
from schemas import (
    LeaveTypeCreate, LeaveTypeResponse,
    HolidayCreate, HolidayResponse,UserResponse
)
from auth import admin_required

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.post("/leave-types", response_model=LeaveTypeResponse)
def create_leave_type(
    data: LeaveTypeCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    # Check duplicate leave type
    existing = db.query(LeaveType).filter(LeaveType.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leave type already exists"
        )

    # Create leave type
    leave_type = LeaveType(
        name=data.name,
        max_leaves_per_year=data.max_leaves_per_year
    )

    db.add(leave_type)
    db.commit()
    db.refresh(leave_type)

    # Initialize leave balance for all employees
    employees = db.query(User).filter(User.role == UserRole.employee).all()

    for emp in employees:
        balance = LeaveBalance(
            user_id=emp.id,
            leave_type_id=leave_type.id,
            remaining_days=data.max_leaves_per_year
        )
        db.add(balance)

    db.commit()
    #  Leave balance 

    return leave_type


@router.get("/leave-types", response_model=list[LeaveTypeResponse])
def get_leave_types(
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    return db.query(LeaveType).all()


@router.post("/holidays", response_model=HolidayResponse)
def add_holiday(
    data: HolidayCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    existing = db.query(Holiday).filter(Holiday.date == data.date).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Holiday already exists"
        )

    holiday = Holiday(
        date=data.date,
        name=data.name
    )

    db.add(holiday)
    db.commit()
    db.refresh(holiday)

    return holiday


@router.get("/holidays", response_model=list[HolidayResponse])
def get_holidays(
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    return db.query(Holiday).all()


@router.get("/managers", response_model=list[UserResponse])
def get_all_managers(
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    managers = db.query(User).filter(User.role == UserRole.manager).all()
    return managers

@router.get("/employees", response_model=list[UserResponse])
def get_all_employees(
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    employees = db.query(User).filter(User.role == UserRole.employee).all()
    return employees



@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    #  not allow deleting admins
    if user.role == UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="Admin users cannot be deleted"
        )

    # Delete related leave requests
    db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == user.id
    ).delete()

    #  Delete related leave balances
    db.query(LeaveBalance).filter(
        LeaveBalance.user_id == user.id
    ).delete()

    # Delete user
    db.delete(user)
    db.commit()

    return {
        "message": f"{user.role.value.capitalize()} deleted successfully"
    }
