def test_register_user(client):
    res = client.post("/auth/register", json={
        "name": "Test User",
        "email": "testuser@test.com",
        "password": "password123",
        "role": "employee"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "testuser@test.com"


def test_login_user(client):
    res = client.post(
        "/auth/login",
        data={"username": "testuser@test.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert res.status_code == 200
    assert "access_token" in res.json()
