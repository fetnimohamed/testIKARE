# services/events.py

from datetime_event_store import DatetimeEventStore
from models.event import EventCreate, EventInDB, EventUpdate
from typing import List, Optional
from datetime import datetime

# Créer une instance globale de DatetimeEventStore
event_store = DatetimeEventStore(
    connection_string="mongodb://localhost:27017/",
    db_name="event_store_api",
    collection_name="events"
)

def get_events(start: Optional[datetime] = None, end: Optional[datetime] = None) -> List[EventInDB]:
    """
    Récupère les événements dans une plage de dates donnée
    """
    # Si aucune date n'est spécifiée, on prend une plage large
    if start is None:
        start = datetime(2000, 1, 1)
    if end is None:
        end = datetime(2100, 12, 31)
    
    # Récupérer les événements depuis MongoDB
    events_data = []
    for event in event_store.get_events(start, end):
        events_data.append(
            EventInDB(
                id=event.id,
                name=event.name,
                importance=event.importance,
                at=event.at,
                created_at=event.at,  # À adapter selon vos besoins
                updated_at=None
            )
        )
    
    return events_data

def create_event(event_data: EventCreate) -> EventInDB:
    """
    Crée un nouvel événement
    """
    # Stocker l'événement dans MongoDB
    event = event_store.store_event(
        at=event_data.at,
        name=event_data.name,
        importance=event_data.importance
    )
    
    # Retourner l'événement créé au format API
    return EventInDB(
        id=event.id,
        name=event.name,
        importance=event.importance,
        at=event.at,
        created_at=datetime.now(),
        updated_at=None
    )

def delete_event(event_id: str) -> bool:
    """
    Supprime un événement par son ID
    """
    return event_store.delete_event(event_id)

def get_event_by_id(event_id: str) -> Optional[EventInDB]:
    """
    Récupère un événement par son ID
    """
    event = event_store.get_event_by_id(event_id)
    if not event:
        return None
    
    return EventInDB(
        id=event.id,
        name=event.name,
        importance=event.importance,
        at=event.at,
        created_at=event.at,  # À adapter selon vos besoins
        updated_at=None
    )

def update_event(event_id: str, event_data: EventUpdate) -> Optional[EventInDB]:
    """
    Met à jour un événement existant
    """
    updated_event = event_store.update_event(
        event_id=event_id,
        name=event_data.name,
        at=event_data.at,
        importance=event_data.importance
    )
    
    if not updated_event:
        return None
    
    return EventInDB(
        id=updated_event.id,
        name=updated_event.name,
        importance=updated_event.importance,
        at=updated_event.at,
        created_at=updated_event.at,  # À adapter selon vos besoins
        updated_at=datetime.now()
    )