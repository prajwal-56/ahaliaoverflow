from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.qr_service import generate_qr_bytes
from services.email_service import send_registration_confirmation
from middleware.auth_middleware import get_current_user
import uuid, os

router = APIRouter()

class RegisterPayload(BaseModel):
    event_id: str
    transaction_id: str | None = None  # Required for paid events

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
    
    # Validate transaction_id for paid events
    registration_fee = event.data.get("registration_fee") or 0
    if registration_fee > 0:
        if not payload.transaction_id:
            raise HTTPException(status_code=400, detail="Transaction ID is required for paid events")
        # UPI transaction IDs are typically 12+ alphanumeric characters
        clean_txn = payload.transaction_id.strip()
        if len(clean_txn) < 12 or not clean_txn.isalnum():
            raise HTTPException(status_code=400, detail="Invalid Transaction ID. Must be 12+ alphanumeric characters (as shown in your UPI app).")
    
    profile = supabase.table("users").select("*").eq("id", user.id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User profile not found. Please complete your profile.")
    token = str(uuid.uuid4())
    
    # Generate QR image bytes in memory
    qr_bytes = generate_qr_bytes(token)
    
    # Upload to Supabase Storage in 'qr-codes' bucket
    filename = f"{token}.png"
    try:
        supabase.storage.from_("qr-codes").upload(
            path=filename,
            file=qr_bytes,
            file_options={"content-type": "image/png"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload QR code to storage: {str(e)}")

    # Get public URL
    qr_url = supabase.storage.from_("qr-codes").get_public_url(filename)
    
    reg_data = {
        "user_id": user.id,
        "event_id": payload.event_id,
        "token": token,
        "checked_in": False,
        "transaction_id": payload.transaction_id.strip() if payload.transaction_id else None
    }
    registration = supabase.table("registrations").insert(reg_data).execute()
    
    event_date = event.data["date"][:10] if event.data.get("date") else "TBA"
    try:
        send_registration_confirmation(
            to=profile.data["email"],
            full_name=profile.data["full_name"],
            event_title=event.data["title"],
            event_date=event_date,
            qr_url=qr_url,
            token=token,
            transaction_id=payload.transaction_id,
            registration_fee=registration_fee
        )
    except Exception as e:
        print(f"Email failed: {e}")
    return {"message": "Registered successfully. Check your email for the QR code.", "registration_id": registration.data[0]["id"], "token": token}


@router.get("/my")
def my_registrations(user=Depends(get_current_user)):
    result = supabase.table("registrations").select("*, events(*)").eq("user_id", user.id).execute()
    return result.data

@router.delete("/{registration_id}")
def cancel_registration(registration_id: str, user=Depends(get_current_user)):
    reg = supabase.table("registrations").select("*").eq("id", registration_id).single().execute()
    if not reg.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    if reg.data["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own registrations")
    
    # Delete from DB
    supabase.table("registrations").delete().eq("id", registration_id).execute()
    
    # Clean up QR code from Supabase Storage
    token = reg.data["token"]
    try:
        supabase.storage.from_("qr-codes").remove([f"{token}.png"])
    except Exception as e:
        print(f"Failed to remove QR code from storage: {e}")
            
    return {"message": "Registration cancelled successfully"}
