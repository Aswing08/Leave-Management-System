def test_register_admin(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Admin",
            "email": "admin@test.com",
            "password": "admin123",
            "role": "admin"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"


def test_register_manager(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Manager",
            "email": "manager@test.com",
            "password": "manager123",
            "role": "manager"
        }
    )

    assert response.status_code == 200
    assert response.json()["role"] == "manager"


def test_register_employee(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Employee",
            "email": "employee@test.com",
            "password": "employee123",
            "role": "employee"
        }
    )

    assert response.status_code == 200
    assert response.json()["role"] == "employee"


def test_login_admin(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "admin@test.com",
            "password": "admin123"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
