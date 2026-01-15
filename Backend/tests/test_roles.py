def get_token(client, email, password):
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )
    return response.json()["access_token"]


def test_admin_can_access_admin_api(client):
    token = get_token(client, "admin@test.com", "admin123")

    response = client.get(
        "/admin/employees",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200


def test_manager_can_access_manager_api(client):
    token = get_token(client, "manager@test.com", "manager123")

    response = client.get(
        "/manager/employees",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200


def test_employee_can_access_employee_api(client):
    token = get_token(client, "employee@test.com", "employee123")

    response = client.get(
        "/employee/leaves",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
