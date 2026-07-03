# Coding Club Ahalia — Complete Setup & Deployment Guide

## ✅ What Was Built

```
codingclubAhalia/
├── backend/                    ← FastAPI (Python)
│   ├── main.py
│   ├── requirements.txt
│   ├── .env                    ← configured with your credentials
│   ├── routers/
│   │   ├── events.py
│   │   ├── registrations.py
│   │   ├── checkin.py
│   │   ├── certificates.py
│   │   └── admin.py
│   ├── services/
│   │   ├── supabase_client.py
│   │   ├── email_service.py
│   │   ├── qr_service.py
│   │   └── certificate_service.py
│   ├── middleware/
│   │   └── auth_middleware.py
│   └── static/
│       └── templates/default.svg
└── frontend/                   ← Next.js 14 (TypeScript)
    ├── app/
    │   ├── page.tsx            ← public homepage
    │   ├── events/             ← events listing + detail
    │   ├── auth/               ← login + signup
    │   ├── dashboard/          ← participant dashboard
    │   ├── organizer/          ← organizer panel + checkin
    │   └── certificate/        ← certificate viewer
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── EventCard.tsx
    │   ├── WinnerCard.tsx
    │   └── QRScanner.tsx
    └── lib/
        ├── supabase.ts
        └── api.ts
```

---

## STEP 1 — Set Up Supabase

### 1a. Your Project Details
*   **Supabase Project ID**: `gazsxolebzixditmawpm`
*   **Supabase Project URL**: `https://gazsxolebzixditmawpm.supabase.co`

### 1b. Run this SQL in your Supabase SQL Editor
Go to [your Supabase SQL Editor](https://supabase.com/dashboard/project/gazsxolebzixditmawpm/sql) and run the following script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mirrors Supabase Auth)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'organizer')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  date            TIMESTAMPTZ NOT NULL,
  venue           TEXT NOT NULL,
  capacity        INTEGER NOT NULL CHECK (capacity > 0),
  cover_image_url TEXT,
  status          TEXT NOT NULL DEFAULT 'upcoming'
                  CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by      UUID REFERENCES public.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registrations table
CREATE TABLE public.registrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  checked_in    BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- Winners table
CREATE TABLE public.winners (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id  UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  position  TEXT NOT NULL,
  prize     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates table
CREATE TABLE public.certificates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
  template_name   TEXT NOT NULL DEFAULT 'default',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own data; events are public
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for anonymous signups" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can read winners" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Users can read own registrations" ON public.registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own certificates" ON public.certificates
  FOR SELECT USING (
    registration_id IN (SELECT id FROM public.registrations WHERE user_id = auth.uid())
  );

-- Sync Trigger: Automatically copy signups from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'participant'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## STEP 2 — Configuration Files (Already Updated!)

### Backend `.env` (`backend/.env`)
```env
SUPABASE_URL=https://gazsxolebzixditmawpm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_service_role_key
GMAIL_ADDRESS=dummy@gmail.com
GMAIL_APP_PASSWORD=dummy-password
FRONTEND_URL=http://localhost:3000
```
> **Gmail Setup**: To receive event QR codes and certificates via email, replace `GMAIL_ADDRESS` and `GMAIL_APP_PASSWORD` (Google Account → Security → App Passwords).

### Frontend `.env.local` (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://gazsxolebzixditmawpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## STEP 3 — Run Locally

Both servers have been set up and are currently running in the background:
*   **Frontend**: `http://localhost:3000`
*   **Backend**: `http://localhost:8000` (docs at `http://localhost:8000/docs`)

If you ever need to manually restart them:

### Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

---

## STEP 4 — Deployment

### Backend → Render
1. Create a Python Web Service on [Render](https://render.com).
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Copy all variables from `backend/.env` into Render's Environment Variables.

### Frontend → Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Copy all variables from `frontend/.env.local` into Vercel's Environment Variables (ensure `NEXT_PUBLIC_API_URL` points to your deployed Render backend instead of localhost).

---

## STEP 5 — First Organizer Setup
After signing up a user, promote them to an organizer using your Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'organizer' WHERE email = 'your-email@example.com';
```
