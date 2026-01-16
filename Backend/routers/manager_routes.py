from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import LeaveRequest, LeaveStatus, LeaveBalance, LeaveType, User, UserRole
from schemas import LeaveRequestResponse, LeaveRejectRequest, UserResponse
from auth import manager_required
from datetime import timedelta


router = APIRouter(
    prefix="/manager",
    tags=["Manager"]
)

@router.get("/employees", response_model=list[UserResponse])
def get_all_employees(
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    employees = db.query(User).filter(User.role == UserRole.employee).all()
    return employees



@router.get("/leaves", response_model=list[LeaveRequestResponse])
def get_all_leaves(
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    return db.query(LeaveRequest).all()


@router.get("/leaves/filter", response_model=list[LeaveRequestResponse])
def filter_leaves(
    status: LeaveStatus,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.status == status)
        .all()
    )



@router.put("/leaves/{leave_id}/approve", response_model=LeaveRequestResponse)
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Leave already processed")

    # Calculate total leave days 
    total_days = (leave.end_date - leave.start_date).days + 1

    # Get or create leave balance
    balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.user_id == leave.employee_id,
            LeaveBalance.leave_type_id == leave.leave_type_id
        )
        .first()
    )

    # If balance doesn't exist, create it with max days from leave type
    if not balance:
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave.leave_type_id).first()
        if not leave_type:
            raise HTTPException(status_code=404, detail="Leave type not found")
        
        balance = LeaveBalance(
            user_id=leave.employee_id,
            leave_type_id=leave.leave_type_id,
            remaining_days=leave_type.max_leaves_per_year
        )
        db.add(balance)
        db.flush()

    # Check if sufficient balance
    if balance.remaining_days < total_days:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient leave balance. Available: {balance.remaining_days} days, Required: {total_days} days"
        )

    balance.remaining_days -= total_days
    leave.status = LeaveStatus.approved

    db.commit()
    db.refresh(leave)
    return leave


@router.put("/leaves/{leave_id}/reject", response_model=LeaveRequestResponse)
def reject_leave(
    leave_id: int,
    data: LeaveRejectRequest,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    if leave.status != LeaveStatus.pending:
        raise HTTPException(
            status_code=400,
            detail="Leave already processed"
        )

    leave.status = LeaveStatus.rejected
    leave.manager_remark = data.manager_remark
    db.commit()
    db.refresh(leave)

    return leave
