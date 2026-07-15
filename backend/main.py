from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import events, registrations, checkin, admin
import os

app = FastAPI(title="Ahalia Overflow API")

# Build allowed origins — filter out None in case env var is not set
_frontend_url = os.getenv("FRONTEND_URL")
allowed_origins = list(filter(None, [
    _frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]))

print(f"[CORS] Allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(registrations.router, prefix="/registrations", tags=["Registrations"])
app.include_router(checkin.router, prefix="/checkin", tags=["Check-in"])
# app.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/")
def root():
    allowed = os.getenv("FRONTEND_URL", "not set")
    return {"status": "Ahalia Overflow API is running", "cors_frontend_url": allowed}

