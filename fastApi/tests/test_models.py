from datetime import datetime
from models.event import EventBase, EventCreate, EventUpdate, EventInDB, EventResponse

def test_event_base_model():
    event_data = {
        "name": "Test Event",
        "importance": "haute"
    }
    event = EventBase(**event_data)
    assert event.name == "Test Event"
    assert event.importance == "haute"

def test_event_create_model():
    event_data = {
        "name": "Test Event",
        "importance": "haute",
        "at": datetime.now()
    }
    event = EventCreate(**event_data)
    assert event.name == "Test Event"
    assert event.importance == "haute"
    assert isinstance(event.at, datetime)

def test_event_update_model():
    event_data = {
        "name": "Updated Event"
    }
    event = EventUpdate(**event_data)
    assert event.name == "Updated Event"
    assert event.importance is None
    assert event.at is None
    
    event_data_full = {
        "name": "Updated Event",
        "importance": "critique",
        "at": datetime.now()
    }
    event_full = EventUpdate(**event_data_full)
    assert event_full.name == "Updated Event"
    assert event_full.importance == "critique"
    assert isinstance(event_full.at, datetime)

def test_event_in_db_model():
    current_time = datetime.now()
    event_data = {
        "id": "123",
        "name": "Test Event",
        "importance": "normale",
        "at": current_time,
        "created_at": current_time,
        "updated_at": None
    }
    event = EventInDB(**event_data)
    assert event.id == "123"
    assert event.name == "Test Event"
    assert event.importance == "normale"
    assert event.at == current_time
    assert event.created_at == current_time
    assert event.updated_at is None

def test_event_response_model():
    current_time = datetime.now()
    event_data = {
        "id": "123",
        "name": "Test Event",
        "importance": "normale",
        "at": current_time,
        "created_at": current_time,
        "updated_at": None
    }
    event = EventResponse(**event_data)
    assert event.id == "123"
    assert event.name == "Test Event"
    assert event.importance == "normale"
    assert event.at == current_time
    assert event.created_at == current_time
    assert event.updated_at is None
    
    event_dict = event.dict()
    assert isinstance(event_dict, dict)
    assert event_dict["id"] == "123"
    assert event_dict["name"] == "Test Event"