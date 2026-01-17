def get_employee_token(client):
    res = client.post(
        "/auth/login",
        data={"username": "employee@test.com", "password": "employee123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return res.json()["access_token"]


def test_apply_leave(client):
    token = get_employee_token(client)

    res = client.post(
        "/employee/leaves/apply",
        json={
            "leave_type_id": 1,
            "start_date": "2026-02-01",
            "end_date": "2026-02-03",
            "reason": "Medical"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
    assert res.json()["status"] == "Pending"


def test_get_leave_history(client):
    token = get_employee_token(client)

    res = client.get(
        "/employee/leaves/history",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
