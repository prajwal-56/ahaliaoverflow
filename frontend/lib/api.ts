const API_URL = process.env.NEXT_PUBLIC_API_URL

async function authHeaders() {
  const { supabase } = await import('./supabase')
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export async function getEvents(status?: string) {
  const url = status ? `${API_URL}/events/?status=${status}` : `${API_URL}/events/`
  const res = await fetch(url)
  return res.json()
}

export async function getEvent(id: string) {
  const res = await fetch(`${API_URL}/events/${id}`)
  return res.json()
}

export async function registerForEvent(eventId: string) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/registrations/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ event_id: eventId })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Registration failed')
  }
  return res.json()
}

export async function getMyRegistrations() {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/registrations/my`, { headers })
  return res.json()
}

export async function checkInByToken(token: string) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/checkin/${token}`, {
    method: 'POST',
    headers
  })
  return res.json()
}

export async function getCertificate(registrationId: string) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/certificates/${registrationId}`, { headers })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Certificate not available')
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export async function createEvent(data: {
  title: string, description: string, date?: string,
  venue: string, capacity: number, cover_image_url?: string,
  host_organizer?: string
}) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/events/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to create event')
  }
  return res.json()
}

export async function updateEvent(id: string, data: {
  title?: string, description?: string, date?: string,
  venue?: string, capacity?: number, cover_image_url?: string,
  host_organizer?: string, status?: string
}) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to update event')
  }
  return res.json()
}

export async function uploadEventImage(formData: FormData) {
  const { supabase } = await import('./supabase')
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${API_URL}/events/upload-image`, {
    method: 'POST',
    headers,
    body: formData
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to upload image')
  }
  return res.json()
}

export async function cancelRegistration(registrationId: string) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/registrations/${registrationId}`, {
    method: 'DELETE',
    headers
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to cancel registration')
  }
  return res.json()
}

export async function getEventRegistrations(eventId: string) {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/admin/events/${eventId}/registrations`, { headers })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to load registrations')
  }
  return res.json()
}
