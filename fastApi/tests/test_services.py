import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
from services.events import get_events, create_event, delete_event, get_event_by_id, update_event
from models.event import EventCreate, EventUpdate

# Mock de la classe Event du DatetimeEventStore
class MockEvent:
    def __init__(self, at, name, importance, event_id=None):
        self.at = at
        self.name = name
        self.importance = importance
        self.id = event_id

@pytest.fixture
def mock_event_store():
    with patch("services.events.event_store") as mock_store:
        yield mock_store

def test_get_events(mock_event_store):
    # Préparer les données de test
    now = datetime.now()
    mock_events = [
        MockEvent(now, "Event 1", "normale", "1"),
        MockEvent(now, "Event 2", "haute", "2")
    ]
    mock_event_store.get_events.return_value = mock_events
    
    # Appeler la fonction à tester
    result = get_events(start=now, end=now)
    
    # Vérifier les résultats
    assert len(result) == 2
    assert result[0].name == "Event 1"
    assert result[0].id == "1"
    assert result[1].name == "Event 2"
    assert result[1].importance == "haute"
    
    # Vérifier que get_events du store a été appelé avec les bons paramètres
    mock_event_store.get_events.assert_called_once_with(now, now)

def test_create_event(mock_event_store):
    # Préparer les données de test
    now = datetime.now()
    event_data = EventCreate(name="New Event", importance="critique", at=now)
    mock_event = MockEvent(now, "New Event", "critique", "new-id")
    mock_event_store.store_event.return_value = mock_event
    
    # Appeler la fonction à tester
    result = create_event(event_data)
    
    # Vérifier les résultats
    assert result.name == "New Event"
    assert result.importance == "critique"
    assert result.id == "new-id"
    assert result.at == now
    
    # Vérifier que store_event a été appelé avec les bons paramètres
    mock_event_store.store_event.assert_called_once_with(
        at=now, name="New Event", importance="critique"
    )

def test_delete_event(mock_event_store):
    # Préparer les données de test
    event_id = "1"
    mock_event_store.delete_event.return_value = True
    
    # Appeler la fonction à tester
    result = delete_event(event_id)
    
    # Vérifier les résultats
    assert result is True
    
    # Vérifier que delete_event a été appelé avec le bon ID
    mock_event_store.delete_event.assert_called_once_with(event_id)

def test_get_event_by_id(mock_event_store):
    # Préparer les données de test
    event_id = "1"
    now = datetime.now()
    mock_event = MockEvent(now, "Event 1", "normale", event_id)
    mock_event_store.get_event_by_id.return_value = mock_event
    
    # Appeler la fonction à tester
    result = get_event_by_id(event_id)
    
    # Vérifier les résultats
    assert result.id == event_id
    assert result.name == "Event 1"
    assert result.importance == "normale"
    
    # Vérifier que get_event_by_id a été appelé avec le bon ID
    mock_event_store.get_event_by_id.assert_called_once_with(event_id)

def test_get_event_by_id_not_found(mock_event_store):
    # Préparer les données de test
    event_id = "nonexistent"
    mock_event_store.get_event_by_id.return_value = None
    
    # Appeler la fonction à tester
    result = get_event_by_id(event_id)
    
    # Vérifier les résultats
    assert result is None
    
    # Vérifier que get_event_by_id a été appelé avec le bon ID
    mock_event_store.get_event_by_id.assert_called_once_with(event_id)

def test_update_event(mock_event_store):
    # Préparer les données de test
    event_id = "1"
    now = datetime.now()
    event_data = EventUpdate(name="Updated Event", importance="haute")
    mock_event = MockEvent(now, "Updated Event", "haute", event_id)
    mock_event_store.update_event.return_value = mock_event
    
    # Appeler la fonction à tester
    result = update_event(event_id, event_data)
    
    # Vérifier les résultats
    assert result.id == event_id
    assert result.name == "Updated Event"
    assert result.importance == "haute"
    
    # Vérifier que update_event a été appelé avec les bons paramètres
    mock_event_store.update_event.assert_called_once_with(
        event_id=event_id,
        name="Updated Event",
        importance="haute",
        at=None  # None car non fourni dans event_data
    )

def test_update_event_not_found(mock_event_store):
    # Préparer les données de test
    event_id = "nonexistent"
    event_data = EventUpdate(name="Updated Event")
    mock_event_store.update_event.return_value = None
    
    # Appeler la fonction à tester
    result = update_event(event_id, event_data)
    
    # Vérifier les résultats
    assert result is None
    
    # Vérifier que update_event a été appelé avec les bons paramètres
    mock_event_store.update_event.assert_called_once_with(
        event_id=event_id,
        name="Updated Event",
        importance=None,
        at=None
    )