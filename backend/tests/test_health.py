import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check_returns_200():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["source"] == "simulated"
    assert "timestamp" in data
