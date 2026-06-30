from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.qr_service import generate_qr
from services.email_service import send_registration_confirmation
from middleware.auth_middleware import get_current_user
import uuid, os

router = APIRouter()

class RegisterPayload(BaseModel):
    event_id: str

@router.post("/")
def register_for_event(payload: RegisterPayload, user=Depends(get_current_user)):
    event = supabase.table("events").select("*").eq("id", payload.event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.data["status"] not in ["upcoming", "ongoing"]:
        raise HTTPException(status_code=400, detail="Event is not open for registration")
    count = supabase.table("registrations").select("id", count="exact").eq("event_id", payload.event_id).execute()
    if count.count >= event.data["capacity"]:
        raise HTTPException(status_code=400, detail="Event is at full capacity")
    existing = supabase.table("registrations").select("id").eq("user_id", user.id).eq("event_id", payload.event_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
    profile = supabase.table("users").select("*").eq("id", user.id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User profile not found. Please complete your profile.")
    token = str(uuid.uuid4())
    reg_data = {"user_id": user.id, "event_id": payload.event_id, "token": token, "checked_in": False}
    registration = supabase.table("registrations").insert(reg_data).execute()
    qr_dir = f"static/qr/{payload.event_id}"
    qr_path = f"{qr_dir}/{token}.png"
    generate_qr(token, qr_path)
    event_date = event.data["date"][:10]
    try:
        send_registration_confirmation(
            to=profile.data["email"],
            full_name=profile.data["full_name"],
            event_title=event.data["title"],
            event_date=event_date,
            qr_path=qr_path,
            token=token
        )
    except Exception as e:
        print(f"Email failed: {e}")
    return {"message": "Registered successfully. Check your email for the QR code.", "registration_id": registration.data[0]["id"], "token": token}

@router.get("/my")
def my_registrations(user=Depends(get_current_user)):
    result = supabase.table("registrations").select("*, events(*)").eq("user_id", user.id).execute()
    return result.data
