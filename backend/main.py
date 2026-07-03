from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import events, registrations, checkin, certificates, admin
import os

app = FastAPI(title="Coding Club Ahalia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL"), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(registrations.router, prefix="/registrations", tags=["Registrations"])
app.include_router(checkin.router, prefix="/checkin", tags=["Check-in"])
app.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"status": "Coding Club Ahalia API is running"}
