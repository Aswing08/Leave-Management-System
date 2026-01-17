def get_admin_token(client):
    res = client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return res.json()["access_token"]


def test_create_leave_type(client):
    token = get_admin_token(client)

    res = client.post(
        "/admin/leave-types",
        json={"name": "Sick Leave", "max_leaves_per_year": 10},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
    assert res.json()["name"] == "Sick Leave"


def test_add_holiday(client):
    token = get_admin_token(client)

    res = client.post(
        "/admin/holidays",
        json={"date": "2026-01-26", "name": "Republic Day"},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
