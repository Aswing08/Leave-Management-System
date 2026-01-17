def get_manager_token(client):
    res = client.post(
        "/auth/login",
        data={"username": "manager@test.com", "password": "manager123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return res.json()["access_token"]


def test_get_pending_leaves(client):
    token = get_manager_token(client)

    res = client.get(
        "/manager/leaves/filter?status=Pending",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_approve_leave(client):
    token = get_manager_token(client)

    res = client.put(
        "/manager/leaves/1/approve",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
