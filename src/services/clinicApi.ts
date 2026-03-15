export interface Doctor {
  id: number
  name: string
  specialization?: string
  photo_url?: string
}

export interface Service {
  id: number
  name: string
  description?: string
}

export interface Section {
  id: string
  name: string
  visible: boolean
  order: number
}

export interface OpeningHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export interface Gallery {
  id?: number
  url: string
  title?: string
}

export interface Review {
  id?: number
  author: string
  rating: number
  comment: string
  date?: string
}

export interface SeoData {
  title: string
  description: string
  keywords: string[]
  og_image: string | null
}

export interface TenantDomain {
  id: number
  domain: string
  tenant_id: string
}

export interface Tenant {
  id: string
  name: string
  domains: TenantDomain[]
}

export interface Branch {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface ClinicData {
  id: number
  tenant_id: string
  color: string
  clinic_name: string
  tagline: string
  enable_appointment_button: boolean
  sections?: Section[]
  slug: string
  phone: string
  email?: string | null
  address: string
  logo_url: string | null
  service_ids?: number[]
  doctor_ids?: number[]
  opening_hours?: OpeningHours | null
  gallery?: Gallery[]
  reviews?: Review[]
  services?: Service[]
  doctors?: Doctor[]
  seo?: SeoData
  tenant?: Tenant
  branches?: Branch[]
  created_at?: string
  updated_at?: string
}

// Mapping slug → tenant_domain (generated at build time)
import clinicMapping from '@/data/clinicMapping.json'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vet.digispace.pro'
const isDev = process.env.NODE_ENV !== 'production'
const frontendKey = process.env.NEXT_PUBLIC_FRONTEND_KEY || ''

// Clinic list item with catalog data from /api/clinics/list
export interface ClinicListItem {
  slug: string
  tenant_domain: string
  clinic_name: string
  tagline: string
  address: string
  phone: string
  logo_url: string | null
  color: string
}

// Get tenant domain by slug
function getTenantDomain(slug: string): string {
  // In dev mode always use API_BASE_URL from .env
  if (isDev) {
    return API_BASE_URL
  }
  // In production use tenant mapping
  const mapping = clinicMapping as Record<string, string>
  return mapping[slug] || API_BASE_URL
}

// Appointment data for booking
export interface AppointmentData {
  owner_name: string
  pet_name: string
  animal_type: string
  phone: string
  email?: string
  service_reason?: string
  pet_age?: string
  appointment_at: string
  status: 'draft' | 'pending' | 'confirmed'
  branch_id?: number
}

// Get tenant domain from clinic data
function getTenantDomainFromClinic(clinicData: ClinicData): string {
  // Try to get domain from tenant.domains array
  if (clinicData.tenant?.domains && clinicData.tenant.domains.length > 0) {
    const domain = clinicData.tenant.domains[0].domain
    // Add protocol if missing
    if (domain.includes('localhost')) {
      return `http://${domain}`
    }
    return domain.startsWith('http') ? domain : `https://${domain}`
  }

  // Fallback to slug-based lookup
  return getTenantDomain(clinicData.slug)
}

// Create appointment at a clinic
export async function createAppointment(clinicData: ClinicData, data: AppointmentData): Promise<{ success: boolean; message?: string }> {
  const tenantDomain = getTenantDomainFromClinic(clinicData)
  const baseUrl = tenantDomain.startsWith('http') ? tenantDomain : `https://${tenantDomain}`
  const url = `${baseUrl}/api/public/appointments`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Frontend-Key': frontendKey,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Try to parse structured validation errors from the API and return a readable message
      const errorData = await response.json().catch(() => ({}))

      // Common shapes: { message: '...', errors: { field: ['msg'] } } or { errors: ['msg'] }
      let msg = ''

      if (errorData) {
        if (typeof errorData.message === 'string' && errorData.message.length > 0) {
          msg = errorData.message
        } else if (errorData.errors) {
          // errors may be object or array
          if (Array.isArray(errorData.errors)) {
            msg = errorData.errors.join('; ')
          } else if (typeof errorData.errors === 'object') {
            // join object values
            msg = Object.entries(errorData.errors)
              .map(([k, v]) => {
                if (Array.isArray(v)) return `${k}: ${v.join(', ')}`
                return `${k}: ${String(v)}`
              })
              .join('; ')
          }
        } else if (typeof errorData === 'string' && errorData.length > 0) {
          msg = errorData
        }
      }

      if (!msg) msg = `Failed to create appointment: ${response.status}`

      const err = new Error(msg)
      // Attach original payload for debugging
      try { (err as any).response = { status: response.status, data: errorData } } catch {}
      throw err
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating appointment:', error)
    throw error
  }
}
// Get available slots for a specific date and branch
export async function getAvailableSlots(clinicData: ClinicData, date: string, branchId: number): Promise<Array<{ time: string, available: boolean }>> {
  const tenantDomain = getTenantDomainFromClinic(clinicData)
  const baseUrl = tenantDomain.startsWith('http') ? tenantDomain : `https://${tenantDomain}`
  const url = `${baseUrl}/api/appointments/public-available-slots?date=${date}&branch_id=${branchId}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Frontend-Key': frontendKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch slots: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching available slots:', error)
    throw error
  }
}
