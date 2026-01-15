from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import LeaveRequest, LeaveStatus,LeaveBalance,User, UserRole
from schemas import LeaveRequestResponse, LeaveRejectRequest,UserResponse
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



@router.put("/leaves/{leave_id}/approve")
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

    # Calculate total leave days (simple diff)
    total_days = (leave.end_date - leave.start_date).days + 1

    balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.user_id == leave.employee_id,
            LeaveBalance.leave_type_id == leave.leave_type_id
        )
        .first()
    )

    if not balance or balance.remaining_days < total_days:
        raise HTTPException(
            status_code=400,
            detail="Insufficient leave balance"
        )

    balance.remaining_days -= total_days
    leave.status = LeaveStatus.approved

    db.commit()
    return {"message": "Leave approved and balance deducted"}


@router.put("/leaves/{leave_id}/reject")
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

    return {"message": "Leave rejected"}
