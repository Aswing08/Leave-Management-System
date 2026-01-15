import pytest
from fastapi.testclient import TestClient

from Backend.main import app
from Backend.database import Base, engine

# 🔹 Create a clean DB for tests
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)
