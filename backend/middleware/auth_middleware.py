from fastapi import HTTPException, Header
from services.supabase_client import supabase

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    token = authorization.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")

async def get_organizer_user(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    profile = supabase.table("users").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Organizer access required")
    return user
