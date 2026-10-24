import pytest

def test_users_crud_and_reserved_demo_ids(client, api_repo):
    body={"name":"  Jamie  ","bedtime":"22:30","smoker":True,"hormonal_bc":False}
    response=client.post("/users",json=body)
    assert response.status_code == 200
    user=response.json()
    assert user["id"] >= 4 and user["name"] == "Jamie"
    assert api_repo.get_user(2) is None and api_repo.get_user(3) is None
    assert client.get(f"/users/{user['id']}").json() == user
    result=client.patch(f"/users/{user['id']}",json={"bedtime":"23:00","tolerance_min":5}).json()
    assert result["bedtime"] == "23:00:00" and result["tolerance_min"] == 5
    assert client.patch(f"/users/{user['id']}",json={}).json() == result

@pytest.mark.parametrize("body", [{"tolerance_min":6},{"tolerance_min":None},{"bedtime":None},
                                  {"bedtime":"23:30+01:00"},{"id":2}])
def test_settings_validation(client,body):
    assert client.patch("/users/1",json=body).status_code == 422

def test_missing_and_invalid_users(client):
    assert client.get("/users/999").status_code == 404
    assert client.patch("/users/999",json={"tolerance_min":10}).status_code == 404
    assert client.post("/users",json={"name":" ","bedtime":"23:00"}).status_code == 422
    assert client.post("/users",json={"name":"J","bedtime":"25:00"}).status_code == 422
