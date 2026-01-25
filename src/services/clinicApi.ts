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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchClinicBySlug(slug: string): Promise<ClinicData> {
  const url = `${API_BASE_URL}/api/clinic-catalog/vet-card/${slug}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch clinic data: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()

    // Extract data from nested structure if it exists
    const data = responseData.data || responseData
    return data
  } catch (error) {
    console.error('Error fetching clinic data:', error)
    throw error
  }
}
