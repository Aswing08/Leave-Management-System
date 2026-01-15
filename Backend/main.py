from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth_routes,admin_routes,employee_routes,manager_routes

app=FastAPI(title="Leave Management System",
            description="Make Life Easy",
            version="1.0.0")
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change to frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth_routes.router)

app.include_router(admin_routes.router)

app.include_router(employee_routes.router)

app.include_router(manager_routes.router)
@app.get("/")
def root():
    return {"message": "Leave Management System API is running"}


