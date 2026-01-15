from sqlalchemy import Column,Integer,String,Enum,DateTime,Date,ForeignKey
from database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    employee="employee"
    manager="manager"
    admin="admin"

class LeaveStatus(str, enum.Enum):
    pending="Pending"
    approved="Approved"
    rejected="Rejected"


class User(Base):              #employee manager
    __tablename__="users"

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String, nullable=False)
    email=Column(String,unique=True,index=True,nullable=False)
    password_hash=Column(String,nullable=False)
    role=Column(Enum(UserRole),
                default=UserRole.employee)
    created_at=Column(DateTime,default=datetime.utcnow)
    leave_requests=relationship("LeaveRequest",back_populates="employee")


class LeaveType(Base):       #admin
    __tablename__="leave_types"

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,unique=True,nullable=False)
    max_leaves_per_year=Column(Integer,nullable=False)
    created_at=Column(DateTime,default=datetime.utcnow)
    leave_requests=relationship("LeaveRequest",back_populates="leave_type")


class Holiday(Base):              #holiday model
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)



class LeaveRequest(Base):        #core table
    __tablename__="leave_requests"

    id=Column(Integer,primary_key=True,index=True)
    employee_id=Column(Integer,ForeignKey("users.id"),nullable=False)
    leave_type_id=Column(Integer,ForeignKey("leave_types.id"),nullable=False)
    start_date=Column(Date,nullable=False)
    end_date=Column(Date,nullable=False)
    reason=Column(String,nullable=False)
    status=Column(Enum(LeaveStatus),default=LeaveStatus.pending)
    manager_remark=Column(String,nullable=True)
    created_at=Column(DateTime,default=datetime.utcnow)
    employee=relationship("User",back_populates="leave_requests")
    leave_type=relationship("LeaveType",back_populates="leave_requests")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"), nullable=False)
    remaining_days = Column(Integer, nullable=False)

    user = relationship("User")
    leave_type = relationship("LeaveType")
