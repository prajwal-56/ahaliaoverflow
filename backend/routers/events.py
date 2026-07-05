from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from services.supabase_client import supabase
from middleware.auth_middleware import get_current_user, get_organizer_user
import os
import uuid
import shutil

router = APIRouter()

class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    venue: str
    capacity: int
    cover_image_url: Optional[str] = None
    host_organizer: Optional[str] = "independent"

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    venue: Optional[str] = None
    capacity: Optional[int] = None
    cover_image_url: Optional[str] = None
    host_organizer: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
def list_events(status: Optional[str] = None):
    # Auto-groom: Mark past events as completed if they are still 'upcoming' or 'ongoing'
    try:
        now_str = datetime.utcnow().isoformat()
        supabase.table("events").update({"status": "completed"}).lt("date", now_str).in_("status", ["upcoming", "ongoing"]).execute()
    except Exception as e:
        print(f"Auto-grooming events failed: {e}")

    query = supabase.table("events").select("*").order("date", desc=False)
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return result.data

@router.get("/{event_id}")
def get_event(event_id: str):
    # Auto-groom single event if expired
    try:
        now_str = datetime.utcnow().isoformat()
        supabase.table("events").update({"status": "completed"}).eq("id", event_id).lt("date", now_str).in_("status", ["upcoming", "ongoing"]).execute()
    except Exception as e:
        print(f"Auto-grooming single event failed: {e}")

    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Also fetch current registered count to show seats left
    count = supabase.table("registrations").select("id", count="exact").eq("event_id", event_id).execute()
    registered_count = count.count or 0
    seats_left = max(0, event.data["capacity"] - registered_count)

    winners = supabase.table("winners").select("*, users(full_name, avatar_url)").eq("event_id", event_id).execute()
    return {**event.data, "winners": winners.data, "seats_left": seats_left, "registered_count": registered_count}

@router.post("/")
def create_event(payload: EventCreate, user=Depends(get_organizer_user)):
    data = {
        "title": payload.title,
        "description": payload.description,
        "date": payload.date.isoformat(),
        "venue": payload.venue,
        "capacity": payload.capacity,
        "cover_image_url": payload.cover_image_url,
        "host_organizer": payload.host_organizer,
        "created_by": user.id,
        "status": "upcoming"
    }
    result = supabase.table("events").insert(data).execute()
    return result.data[0]

@router.put("/{event_id}")
def update_event(event_id: str, payload: EventUpdate, user=Depends(get_organizer_user)):
    # Check if event exists
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = {}
    if payload.title is not None: update_data["title"] = payload.title
    if payload.description is not None: update_data["description"] = payload.description
    if payload.date is not None: update_data["date"] = payload.date.isoformat()
    if payload.venue is not None: update_data["venue"] = payload.venue
    if payload.capacity is not None: update_data["capacity"] = payload.capacity
    if payload.cover_image_url is not None: update_data["cover_image_url"] = payload.cover_image_url
    if payload.host_organizer is not None: update_data["host_organizer"] = payload.host_organizer
    if payload.status is not None: update_data["status"] = payload.status

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    result = supabase.table("events").update(update_data).eq("id", event_id).execute()
    return result.data[0]

@router.patch("/{event_id}/status")
def update_event_status(event_id: str, status: str, user=Depends(get_organizer_user)):
    valid = ["upcoming", "ongoing", "completed", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    result = supabase.table("events").update({"status": status}).eq("id", event_id).execute()
    return result.data[0]

@router.post("/upload-image")
def upload_event_image(file: UploadFile = File(...), user=Depends(get_organizer_user)):
    os.makedirs("static/uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = f"static/uploads/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/static/uploads/{filename}"}
