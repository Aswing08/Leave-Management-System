from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date,timedelta

from database import get_db
from models import LeaveRequest, LeaveStatus,LeaveType,Holiday
from schemas import LeaveRequestCreate, LeaveRequestResponse, LeaveTypeResponse
from auth import employee_required


router = APIRouter(
    prefix="/employee",
    tags=["Employee"]
)


def calculate_working_days(start_date: date, end_date: date, holidays):
    holiday_dates = {h.date for h in holidays}
    working_days = 0
    current_date = start_date

    while current_date <= end_date:
        # Sunday = 6
        if current_date.weekday() != 6 and current_date not in holiday_dates:
            working_days += 1
        current_date += timedelta(days=1)

    return working_days



def get_used_leave_days(db, employee_id, leave_type_id, year):
    approved_leaves = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.leave_type_id == leave_type_id,
            LeaveRequest.status == LeaveStatus.approved
        )
        .all()
    )

    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)
    total_days = 0

    for leave in approved_leaves:
        start = max(leave.start_date, year_start)
        end = min(leave.end_date, year_end)

        if start <= end:
            total_days += (end - start).days + 1

    return total_days


@router.get("/leaves/history")
def leave_history(
    db: Session = Depends(get_db),
    current_user = Depends(employee_required)
):
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == current_user.id
    ).all()

    total_days = 0
    history = []

    for leave in leaves:
        days = (leave.end_date - leave.start_date).days + 1
        
        # Only count approved leaves in total
        if leave.status == LeaveStatus.approved:
            total_days += days

        history.append({
            "leave_id": leave.id,
            "leave_type": leave.leave_type.name,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "days": days,
            "status": leave.status
        })

    return {
        "total_leave_days_taken": total_days,
        "history": history
    }



@router.get("/holidays")
def view_holidays(
    db: Session = Depends(get_db),
    current_user = Depends(employee_required)
):
    return db.query(Holiday).all()


@router.get("/leave-types", response_model=list[LeaveTypeResponse])
def get_leave_types(
    db: Session = Depends(get_db),
    current_user = Depends(employee_required)
):
    return db.query(LeaveType).all()





@router.post("/leaves/apply", response_model=LeaveRequestResponse)
def apply_leave(
    data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user = Depends(employee_required)
):
    # Overlapping leave check
    overlap = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == current_user.id,
            LeaveRequest.status.in_([LeaveStatus.pending, LeaveStatus.approved]),
            LeaveRequest.start_date <= data.end_date,
            LeaveRequest.end_date >= data.start_date
        )
        .first()
    )

    if overlap:
        raise HTTPException(
            status_code=400,
            detail="Leave dates overlap with an existing request"
        )

    # Holiday & Sunday exclusion
    holidays = db.query(Holiday).all()
    working_days = calculate_working_days(
        data.start_date,
        data.end_date,
        holidays
    )

    if working_days <= 0:
        raise HTTPException(
            status_code=400,
            detail="Selected dates contain only holidays or Sundays"
        )

    #  Leave type validation
    leave_type = db.query(LeaveType).filter(
        LeaveType.id == data.leave_type_id
    ).first()

    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave type not found"
        )

    #  Leave balance validation (YEAR SAFE)
    used_days = get_used_leave_days(
        db,
        current_user.id,
        data.leave_type_id,
        data.start_date.year
    )

    remaining_days = leave_type.max_leaves_per_year - used_days

    if working_days > remaining_days:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient leave balance. Remaining: {remaining_days} days"
        )

    #  Create leave request
    leave = LeaveRequest(
        employee_id=current_user.id,
        leave_type_id=data.leave_type_id,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status=LeaveStatus.pending
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@router.get("/leaves", response_model=list[LeaveRequestResponse])
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user = Depends(employee_required)
):
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_user.id)
        .all()
    )

@router.delete("/leaves/{leave_id}")
def cancel_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(employee_required)
):
    leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.id == leave_id,
            LeaveRequest.employee_id == current_user.id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave not found"
        )

    if leave.status != LeaveStatus.pending:
        raise HTTPException(
            status_code=400,
            detail="Only pending leave can be cancelled"
        )

    db.delete(leave)
    db.commit()

    return {"message": "Leave cancelled successfully"}
