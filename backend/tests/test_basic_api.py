from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_endpoint_returns_welcome_message():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to DFS Orbital API"


def test_openapi_schema_is_available():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "paths" in response.json()


def test_health_endpoint_is_available():
    response = client.get("/api/v1/health")

    assert response.status_code == 200