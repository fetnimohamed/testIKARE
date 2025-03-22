from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class EventBase(BaseModel):
    name: str = Field(..., description="Nom de l'événement")
    importance: str = Field(..., description="Niveau d'importance (basse, normale, haute, critique)")

class EventCreate(EventBase):
    at: datetime = Field(..., description="Date et heure de l'événement")

class EventUpdate(EventBase):
    name: Optional[str] = None
    importance: Optional[str] = None
    at: Optional[datetime] = None

class EventInDB(EventBase):
    id: str
    at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

class EventResponse(EventInDB):
    class Config:
        orm_mode = True

class EventList(BaseModel):
    items: List[EventResponse]
    total: int