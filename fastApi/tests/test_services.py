import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
from services.events import get_events, create_event, delete_event, get_event_by_id, update_event
from models.event import EventCreate, EventUpdate

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
    now = datetime.now()
    mock_events = [
        MockEvent(now, "Event 1", "normale", "1"),
        MockEvent(now, "Event 2", "haute", "2")
    ]
    mock_event_store.get_events.return_value = mock_events
    
    result = get_events(start=now, end=now)
    
    assert len(result) == 2
    assert result[0].name == "Event 1"
    assert result[0].id == "1"
    assert result[1].name == "Event 2"
    assert result[1].importance == "haute"
    
    mock_event_store.get_events.assert_called_once_with(now, now)

def test_create_event(mock_event_store):
    now = datetime.now()
    event_data = EventCreate(name="New Event", importance="critique", at=now)
    mock_event = MockEvent(now, "New Event", "critique", "new-id")
    mock_event_store.store_event.return_value = mock_event
    
    result = create_event(event_data)
    
    assert result.name == "New Event"
    assert result.importance == "critique"
    assert result.id == "new-id"
    assert result.at == now
    
    mock_event_store.store_event.assert_called_once_with(
        at=now, name="New Event", importance="critique"
    )

def test_delete_event(mock_event_store):
    event_id = "1"
    mock_event_store.delete_event.return_value = True
    
    result = delete_event(event_id)
    
    assert result is True
    
    mock_event_store.delete_event.assert_called_once_with(event_id)

def test_get_event_by_id(mock_event_store):
    event_id = "1"
    now = datetime.now()
    mock_event = MockEvent(now, "Event 1", "normale", event_id)
    mock_event_store.get_event_by_id.return_value = mock_event
    
    result = get_event_by_id(event_id)
    
    assert result.id == event_id
    assert result.name == "Event 1"
    assert result.importance == "normale"
    
    mock_event_store.get_event_by_id.assert_called_once_with(event_id)

def test_get_event_by_id_not_found(mock_event_store):
    event_id = "nonexistent"
    mock_event_store.get_event_by_id.return_value = None
    
    result = get_event_by_id(event_id)
    
    assert result is None
    
    mock_event_store.get_event_by_id.assert_called_once_with(event_id)

def test_update_event(mock_event_store):
    event_id = "1"
    now = datetime.now()
    event_data = EventUpdate(name="Updated Event", importance="haute")
    mock_event = MockEvent(now, "Updated Event", "haute", event_id)
    mock_event_store.update_event.return_value = mock_event
    
    result = update_event(event_id, event_data)
    
    assert result.id == event_id
    assert result.name == "Updated Event"
    assert result.importance == "haute"
    
    mock_event_store.update_event.assert_called_once_with(
        event_id=event_id,
        name="Updated Event",
        importance="haute",
        at=None  
    )

def test_update_event_not_found(mock_event_store):
 
    event_id = "nonexistent"
    event_data = EventUpdate(name="Updated Event")
    mock_event_store.update_event.return_value = None
    
    result = update_event(event_id, event_data)
    
    assert result is None
    
    mock_event_store.update_event.assert_called_once_with(
        event_id=event_id,
        name="Updated Event",
        importance=None,
        at=None
    )