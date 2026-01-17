# Leave Management System

A comprehensive web application for managing employee leave requests with role-based access control (Admin, Manager, Employee).

## Overview

This Leave Management System is built with a modern tech stack combining a FastAPI backend with a React + TypeScript frontend. It provides an intuitive interface for employees to request leave, managers to approve/reject requests, and admins to manage leave types and holidays.

## Features

### 👤 User Roles & Capabilities

#### Employee
- Apply for leaves (with multiple leave types)
- View personal leave balance
- Track leave request status
- View all submitted leave requests with manager remarks

#### Manager
- View all team member leave requests
- Approve or reject leave requests with remarks
- Monitor team leave status
- Filter requests by status

#### Admin
- Create and manage leave types
- Set maximum leaves per year for each type
- Manage company holidays
- Create new users
- Monitor system-wide leave requests

### 🔐 Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes on frontend and backend
- CORS middleware support

### 📊 Core Functionality
- Leave request management with workflow (Pending → Approved/Rejected)
- Automatic working day calculation (excludes weekends & holidays)
- Leave balance tracking per leave type
- Holiday management
- Leave type management with annual limits

## Tech Stack

### Backend
- **Framework:** FastAPI 0.128.0
- **Database:** SQLAlchemy with SQLite
- **Authentication:** PyJWT, bcrypt, python-jose
- **Validation:** Pydantic
- **Testing:** pytest
- **Server:** Uvicorn

### Frontend
- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Linting:** ESLint

## Project Structure

```
leave-manage-system/
├── Backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py              # SQLAlchemy ORM models
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── database.py            # Database configuration
│   ├── auth.py                # Authentication utilities
│   ├── routers/               # API route handlers
│   │   ├── auth_routes.py
│   │   ├── admin_routes.py
│   │   ├── employee_routes.py
│   │   └── manager_routes.py
│   └── tests/                 # Unit tests
│
├── Frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app component with routing
│   │   ├── main.tsx           # React entry point
│   │   ├── api/               # API integration
│   │   ├── auth/              # Authentication logic & protected routes
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   └── employee/
│   │   └── types/             # TypeScript type definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── virtual/                   # Python virtual environment
```

## Database Models

### User
- Stores employee, manager, and admin accounts
- Fields: id, name, email, password_hash, role, created_at
- Relationships: leave_requests

### LeaveRequest (Core)
- Tracks leave applications
- Fields: id, employee_id, leave_type_id, start_date, end_date, reason, status, manager_remark
- Statuses: Pending, Approved, Rejected

### LeaveType
- Define types of leaves available
- Fields: id, name, max_leaves_per_year
- Example: Annual Leave (20 days), Sick Leave (10 days)

### LeaveBalance
- Tracks remaining leaves per user per leave type
- Automatically calculated based on LeaveRequest history

### Holiday
- Company holidays excluded from working day calculations
- Fields: id, date, name

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login with JWT token generation

### Employee (`/employee`)
- `GET /employee/leaves` - Get my leave requests
- `GET /employee/leaves/leaves-used` - Get leave balance
- `POST /employee/leaves/apply` - Apply for new leave
- `GET /employee/leaves/leave-types` - Get available leave types

### Manager (`/manager`)
- `GET /manager/leaves` - View team leave requests
- `PUT /manager/leaves/{request_id}/approve` - Approve leave request
- `PUT /manager/leaves/{request_id}/reject` - Reject leave request

### Admin (`/admin`)
- `GET /admin/leave-types` - List all leave types
- `POST /admin/leave-types` - Create new leave type
- `GET /admin/holidays` - List all holidays
- `POST /admin/holidays` - Add new holiday
- `POST /admin/users` - Create new user

## Testing

### Run Backend Tests
```bash
cd Backend
pytest tests/
```

Test files:
- `test_auth.py` - Authentication endpoints
- `test_admin.py` - Admin operations
- `test_employee.py` - Employee operations
- `test_manager.py` - Manager operations
- `test_roles.py` - Role-based access control

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Configuration

### CORS Settings
The backend is configured to accept requests from any origin during development:
```python
allow_origins=["*"]
```
**Note:** Change this to specific frontend URL for production.

## Key Features Implemented

✅ Role-based authentication and authorization  
✅ Leave request workflow (apply → approve/reject)  
✅ Automatic working day calculation  
✅ Leave balance management  
✅ Holiday management  
✅ Leave type management  
✅ Manager remarks on leave decisions  
✅ Responsive UI with Tailwind CSS  
✅ Type-safe frontend with TypeScript  
✅ Comprehensive test coverage  

## Known Issues & Fixes

- Status enum capitalization aligned between frontend and backend
- Leave type ID field corrected in API requests
- Protected routes properly validating user roles
- CORS headers configured for frontend-backend communication

## Future Enhancements

- Email notifications for leave approvals/rejections
- Calendar view for leave requests
- Bulk leave import from CSV
- Leave carryover management
- Advanced reporting and analytics
- Multi-department support
- Delegation of approval authority

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please contact the development team or create an issue in the repository.
