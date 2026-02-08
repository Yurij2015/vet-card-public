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
  email?: string
  address: string
  logo_url: string | null
  service_ids?: number[]
  doctor_ids?: number[]
  opening_hours?: OpeningHours
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vet.digispace.pro'
const isDev = import.meta.env.DEV

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

export async function fetchClinicBySlug(slug: string): Promise<ClinicData> {
  const tenantDomain = getTenantDomain(slug)
  const baseUrl = tenantDomain.startsWith('http') ? tenantDomain : `https://${tenantDomain}`

  const url = `${baseUrl}/api/clinic-catalog/vet-card/${slug}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch clinic data: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()

    // Extract data from a nested structure if it exists
    return responseData.data || responseData
  } catch (error) {
    console.error('Error fetching clinic data:', error)
    throw error
  }
}

// Fetch list of all clinics for catalog
export async function fetchClinicsList(): Promise<ClinicListItem[]> {
  const url = `${API_BASE_URL}/api/clinics/list`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch clinics list: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Error fetching clinics list:', error)
    throw error
  }
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

// Create appointment at clinic
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
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create appointment: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating appointment:', error)
    throw error
  }
}

