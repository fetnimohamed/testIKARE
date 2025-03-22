from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime

from models.event import EventCreate, EventResponse, EventUpdate, EventList
from services import events

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}},
)

@router.get("", response_model=EventList)
def get_events(
    start: Optional[datetime] = Query(None, description="Date de début pour filtrer les événements"),
    end: Optional[datetime] = Query(None, description="Date de fin pour filtrer les événements"),
):
    """
    Récupère tous les événements, éventuellement filtrés par plage de dates.
    """
    event_list = events.get_events(start, end)
    return {"items": event_list, "total": len(event_list)}

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event_data: EventCreate):
    """
    Crée un nouvel événement.
    """
    return events.create_event(event_data)

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str):
    """
    Récupère un événement spécifique par son ID.
    """
    event = events.get_event_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, event_data: EventUpdate):
    """
    Met à jour un événement existant.
    """
    updated_event = events.update_event(event_id, event_data)
    if updated_event is None:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return updated_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str):
    """
    Supprime un événement.
    """
    success = events.delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return None