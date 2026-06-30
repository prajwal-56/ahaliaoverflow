from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from services.supabase_client import supabase
from middleware.auth_middleware import get_current_user, get_organizer_user

router = APIRouter()

class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    venue: str
    capacity: int
    cover_image_url: Optional[str] = None

@router.get("/")
def list_events(status: Optional[str] = None):
    query = supabase.table("events").select("*").order("date", desc=False)
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return result.data

@router.get("/{event_id}")
def get_event(event_id: str):
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")
    winners = supabase.table("winners").select("*, users(full_name, avatar_url)").eq("event_id", event_id).execute()
    return {**event.data, "winners": winners.data}

@router.post("/")
def create_event(payload: EventCreate, user=Depends(get_organizer_user)):
    data = {
        "title": payload.title,
        "description": payload.description,
        "date": payload.date.isoformat(),
        "venue": payload.venue,
        "capacity": payload.capacity,
        "cover_image_url": payload.cover_image_url,
        "created_by": user.id,
        "status": "upcoming"
    }
    result = supabase.table("events").insert(data).execute()
    return result.data[0]

@router.patch("/{event_id}/status")
def update_event_status(event_id: str, status: str, user=Depends(get_organizer_user)):
    valid = ["upcoming", "ongoing", "completed", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    result = supabase.table("events").update({"status": status}).eq("id", event_id).execute()
    return result.data[0]
