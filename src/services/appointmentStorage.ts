// Local storage service for saving user appointments

export interface SavedAppointment {
  id: string
  clinic_slug: string
  clinic_name: string
  owner_name: string
  pet_name: string
  animal_type: string
  pet_age: string
  phone: string
  email: string
  service_reason: string
  appointment_at: string
  branch_id?: number
  branch_name?: string
  status: 'draft' | 'pending' | 'confirmed'
  created_at: string
}

const STORAGE_KEY = 'vetcard_appointments'

// Get all saved appointments
export function getSavedAppointments(): SavedAppointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading appointments from localStorage:', error)
    return []
  }
}

// Save a new appointment
export function saveAppointment(appointment: Omit<SavedAppointment, 'id' | 'created_at'>): SavedAppointment {
  const appointments = getSavedAppointments()

  const newAppointment: SavedAppointment = {
    ...appointment,
    id: generateId(),
    created_at: new Date().toISOString(),
  }

  appointments.unshift(newAppointment) // Add to beginning

  // Keep only last 50 appointments
  const trimmedAppointments = appointments.slice(0, 50)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedAppointments))
  } catch (error) {
    console.error('Error saving appointment to localStorage:', error)
  }

  return newAppointment
}

// Remove an appointment by id
export function removeAppointment(id: string): void {
  const appointments = getSavedAppointments()
  const filtered = appointments.filter(a => a.id !== id)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error removing appointment from localStorage:', error)
  }
}

// Get appointments for a specific clinic
export function getAppointmentsByClinic(clinicSlug: string): SavedAppointment[] {
  return getSavedAppointments().filter(a => a.clinic_slug === clinicSlug)
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Format appointment date for display
export function formatAppointmentDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Check if appointment is in the past
export function isAppointmentPast(isoDate: string): boolean {
  return new Date(isoDate) < new Date()
}

// Get upcoming appointments
export function getUpcomingAppointments(): SavedAppointment[] {
  return getSavedAppointments().filter(a => !isAppointmentPast(a.appointment_at))
}

// Get past appointments
export function getPastAppointments(): SavedAppointment[] {
  return getSavedAppointments().filter(a => isAppointmentPast(a.appointment_at))
}

