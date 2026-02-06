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
  created_at?: string
  updated_at?: string
}

// Маппінг slug → tenant_domain (генерується при build)
import clinicMapping from '@/data/clinicMapping.json'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vet.digispace.pro'
const isDev = import.meta.env.DEV

// Отримуємо домен тенанта за slug
function getTenantDomain(slug: string): string {
  // У dev режимі завжди використовуємо API_BASE_URL з .env
  if (isDev) {
    return API_BASE_URL
  }
  // У production використовуємо маппінг тенантів
  const mapping = clinicMapping as Record<string, string>
  return mapping[slug] || API_BASE_URL
}

export async function fetchClinicBySlug(slug: string): Promise<ClinicData> {
  const tenantDomain = getTenantDomain(slug)
  const baseUrl = tenantDomain.startsWith('http') ? tenantDomain : `https://${tenantDomain}`

// У dev режимі через /api, у production — прямий шлях
  const url = isDev
    ? `${baseUrl}/api/clinic-catalog/vet-card/${slug}`
    : `${baseUrl}/clinic-catalog/vet-card/${slug}`

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
