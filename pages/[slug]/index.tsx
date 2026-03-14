import type { GetStaticPaths, GetStaticProps } from 'next'
import ClinicPage from '@/pages/ClinicPage'
import type { ClinicData } from '@/services/clinicApi'

interface Props {
  slug: string
  clinicData: ClinicData
}

export default function ClinicRoute({ slug, clinicData }: Props) {
  return <ClinicPage slug={slug} clinicData={clinicData} />
}

function readClinicsBuildFile(): Array<{ slug: string; tenant_domain: string }> {
  try {
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(process.cwd(), 'src/data/clinics-build.json')
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch {
    // ignore
  }
  return []
}

export const getStaticPaths: GetStaticPaths = async () => {
  let clinics = readClinicsBuildFile()

  // If build-time file is empty, try to fetch the clinic list from API (useful for local dev)
  if ((!clinics || clinics.length === 0) && process.env.NODE_ENV !== 'production') {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vet.digispace.pro'
      const frontendKey = process.env.NEXT_PUBLIC_FRONTEND_KEY || ''
      const res = await fetch(`${API_BASE_URL}/api/clinics/list`, {
        headers: { 'X-Frontend-Key': frontendKey },
      })
      if (res.ok) {
        const data = await res.json()
        clinics = data.data || data
      }
    } catch (e) {
      console.warn('Failed to fetch clinics in getStaticPaths fallback:', e)
    }
  }

  // If still empty, in development include a debug path so you can preview pages
  const paths = (clinics || []).map((c) => ({ params: { slug: c.slug } }))
  if (paths.length === 0 && process.env.NODE_ENV !== 'production') {
    // include a development stub slug so /my-clinic works locally without prebuild
    paths.push({ params: { slug: 'my-clinic' } })
  }

  // For static export, fallback must be false
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vet.digispace.pro'
  const frontendKey = process.env.NEXT_PUBLIC_FRONTEND_KEY || ''

  // Find tenant domain for this clinic
  const clinics = readClinicsBuildFile()
  const clinicEntry = clinics.find((c) => c.slug === slug)
  const tenantDomain = clinicEntry?.tenant_domain || API_BASE_URL
  const baseUrl = tenantDomain.startsWith('http') ? tenantDomain : `https://${tenantDomain}`

  let clinicData: ClinicData | null = null

  try {
    const res = await fetch(`${baseUrl}/api/clinic-catalog/vet-card/${slug}`, {
      headers: { 'X-Frontend-Key': frontendKey },
    })
    if (res.ok) {
      const data = await res.json()
      clinicData = data.data || data
    }
  } catch (e) {
    console.warn(`Failed to fetch clinic ${slug}:`, e)
  }

  if (!clinicData) {
    // During local development, avoid 404 when the external API or build-time data is missing.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Clinic data for slug "${slug}" not found — rendering development stub`)
      const stub: ClinicData = {
        id: 0,
        tenant_id: '',
        color: '#2563eb',
        clinic_name: slug,
        tagline: 'Demo clinic (development fallback)',
        enable_appointment_button: false,
        slug,
        phone: '',
        email: undefined,
        address: '',
        logo_url: null,
        sections: [],
        services: [],
        doctors: [],
        opening_hours: undefined,
        gallery: [],
        reviews: [],
        seo: { title: `${slug} | VetCard`, description: '', keywords: [], og_image: null },
      }

      return { props: { slug, clinicData: stub } }
    }

    return { notFound: true }
  }

  return { props: { slug, clinicData } }
}

