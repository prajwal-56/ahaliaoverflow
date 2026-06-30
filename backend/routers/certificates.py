from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from services.supabase_client import supabase
from services.certificate_service import generate_certificate_png
from services.email_service import send_certificate_ready
from middleware.auth_middleware import get_current_user
import os

router = APIRouter()

@router.get("/{registration_id}")
def get_certificate(registration_id: str, user=Depends(get_current_user)):
    reg = supabase.table("registrations").select("*, users(full_name, email), events(title, date)").eq("id", registration_id).single().execute()
    if not reg.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    if reg.data["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="You can only access your own certificate")
    if not reg.data["checked_in"]:
        raise HTTPException(status_code=403, detail="Certificate is only available for participants who attended the event")
    output_dir = f"static/certificates/{reg.data['event_id']}"
    output_path = f"{output_dir}/{registration_id}.png"
    if not os.path.exists(output_path):
        event_id = reg.data["event_id"]
        template_path = f"static/templates/{event_id}.svg"
        template_name = event_id if os.path.exists(template_path) else "default"
        event_date = reg.data["events"]["date"][:10]
        generate_certificate_png(
            full_name=reg.data["users"]["full_name"],
            event_title=reg.data["events"]["title"],
            event_date=event_date,
            template_name=template_name,
            output_path=output_path
        )
        try:
            supabase.table("certificates").insert({"registration_id": registration_id, "template_name": template_name}).execute()
        except Exception:
            pass
    return FileResponse(path=output_path, media_type="image/png", filename=f"certificate_{registration_id}.png")
