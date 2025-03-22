import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

@pytest.fixture
def mock_event_service():
    with patch("routers.events.events") as mock_service:
        yield mock_service

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_events(mock_event_service):
    # Préparer les données de test
    now = datetime.now()
    mock_events = [
        {
            "id": "1",
            "name": "Test Event 1",
            "importance": "normale",
            "at": now,
            "created_at": now,
            "updated_at": None
        },
        {
            "id": "2",
            "name": "Test Event 2",
            "importance": "haute",
            "at": now,
            "created_at": now,
            "updated_at": None
        }
    ]
    mock_event_service.get_events.return_value = mock_events
    
    # Appeler l'API
    response = client.get("/api/events")
    
    # Vérifier la réponse
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["items"][0]["id"] == "1"
    assert data["items"][1]["id"] == "2"

def test_get_events_with_date_filter(mock_event_service):
    # Préparer les données de test
    now = datetime.now()
    tomorrow = datetime.now().replace(day=datetime.now().day + 1)
    mock_event_service.get_events.return_value = []
    
    # Appeler l'API avec des paramètres de date
    response = client.get(f"/api/events?start={now.isoformat()}&end={tomorrow.isoformat()}")
    
    # Vérifier la réponse
    assert response.status_code == 200
    
    # Vérifier que le service a été appelé avec les bons paramètres
    mock_event_service.get_events.assert_called_once()
    args, kwargs = mock_event_service.get_events.call_args
    assert isinstance(kwargs["start"], datetime)
    assert isinstance(kwargs["end"], datetime)

def test_create_event(mock_event_service):
    # Préparer les données de test
    now = datetime.now()
    new_event = {
        "name": "New Event",
        "importance": "critique",
        "at": now.isoformat()
    }
    mock_event_service.create_event.return_value = {
        "id": "new-id",
        "name": "New Event",
        "importance": "critique",
        "at": now,
        "created_at": now,
        "updated_at": None
    }
    
    # Appeler l'API
    response = client.post("/api/events", json=new_event)
    
    # Vérifier la réponse
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "new-id"
    assert data["name"] == "New Event"
    assert data["importance"] == "critique"

def test_get_event_by_id(mock_event_service):
    # Préparer les données de test
    event_id = "1"
    now = datetime.now()
    mock_event_service.get_event_by_id.return_value = {
        "id": event_id,
        "name": "Test Event",
        "importance": "normale",
        "at": now,
        "created_at": now,
        "updated_at": None
    }
    
    # Appeler l'API
    response = client.get(f"/api/events/{event_id}")
    
    # Vérifier la réponse
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == event_id
    assert data["name"] == "Test Event"

def test_get_event_by_id_not_found(mock_event_service):
    # Préparer les données de test
    event_id = "nonexistent"
    mock_event_service.get_event_by_id.return_value = None
    
    # Appeler l'API
    response = client.get(f"/api/events/{event_id}")
    
    # Vérifier la réponse
    assert response.status_code == 404
    assert "detail" in response.json()

def test_update_event(mock_event_service):
    # Préparer les données de test
    event_id = "1"
    now = datetime.now()
    update_data = {
        "name": "Updated Event",
        "importance": "haute"
    }
    mock_event_service.update_event.return_value = {
        "id": event_id,
        "name": "Updated Event",
        "importance": "haute",
        "at": now,
        "created_at": now,
        "updated_at": now
    }
    
    # Appeler l'API
    response = client.put(f"/api/events/{event_id}", json=update_data)
    
    # Vérifier la réponse
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == event_id
    assert data["name"] == "Updated Event"
    assert data["importance"] == "haute"

def test_update_event_not_found(mock_event_service):
    # Préparer les données de test
    event_id = "nonexistent"
    update_data = {
        "name": "Updated Event"
    }
    mock_event_service.update_event.return_value = None
    
    # Appeler l'API
    response = client.put(f"/api/events/{event_id}", json=update_data)
    
    # Vérifier la réponse
    assert response.status_code == 404
    assert "detail" in response.json()

def test_delete_event(mock_event_service):
    # Préparer les données de test
    event_id = "1"
    mock_event_service.delete_event.return_value = True
    
    # Appeler l'API
    response = client.delete(f"/api/events/{event_id}")
    
    # Vérifier la réponse
    assert response.status_code == 204
    assert response.content == b''  # No content

def test_delete_event_not_found(mock_event_service):
    # Préparer les données de test
    event_id = "nonexistent"
    mock_event_service.delete_event.return_value = False
    
    # Appeler l'API
    response = client.delete(f"/api/events/{event_id}")
    
    # Vérifier la réponse
    assert response.status_code == 404
    assert "detail" in response.json()