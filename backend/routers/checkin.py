from fastapi import APIRouter, Depends, HTTPException
from services.supabase_client import supabase
from middleware.auth_middleware import get_organizer_user
from datetime import datetime, timezone

router = APIRouter()

@router.post("/{token}")
def check_in_by_token(token: str, user=Depends(get_organizer_user)):
    registration = supabase.table("registrations").select("*, users(full_name, email), events(title)").eq("token", token).single().execute()
    if not registration.data:
        raise HTTPException(status_code=404, detail="Invalid QR code — registration not found")
    if registration.data["checked_in"]:
        return {"status": "already_checked_in", "message": f"{registration.data['users']['full_name']} already checked in", "participant": registration.data["users"]["full_name"], "event": registration.data["events"]["title"]}
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("registrations").update({"checked_in": True, "checked_in_at": now}).eq("token", token).execute()
    return {"status": "success", "message": f"Check-in successful for {registration.data['users']['full_name']}", "participant": registration.data["users"]["full_name"], "event": registration.data["events"]["title"]}

@router.get("/event/{event_id}")
def get_event_checkins(event_id: str, user=Depends(get_organizer_user)):
    result = supabase.table("registrations").select("*, users(full_name, email)").eq("event_id", event_id).execute()
    return result.data
