from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from middleware.auth_middleware import get_organizer_user

router = APIRouter()

class WinnerCreate(BaseModel):
    event_id: str
    user_id: str
    position: str
    prize: str = None

@router.post("/winners")
def add_winner(payload: WinnerCreate, user=Depends(get_organizer_user)):
    result = supabase.table("winners").insert({"event_id": payload.event_id, "user_id": payload.user_id, "position": payload.position, "prize": payload.prize}).execute()
    return result.data[0]

@router.get("/events/{event_id}/registrations")
def event_registrations(event_id: str, user=Depends(get_organizer_user)):
    result = supabase.table("registrations").select("*, users(full_name, email)").eq("event_id", event_id).execute()
    return result.data

@router.patch("/users/{user_id}/role")
def set_user_role(user_id: str, role: str, user=Depends(get_organizer_user)):
    if role not in ["participant", "organizer"]:
        raise HTTPException(status_code=400, detail="Role must be 'participant' or 'organizer'")
    result = supabase.table("users").update({"role": role}).eq("id", user_id).execute()
    return result.data[0]
