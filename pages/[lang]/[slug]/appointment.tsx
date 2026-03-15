import type { GetStaticPaths, GetStaticProps } from 'next'
import AppointmentPage, { AppointmentPageProps } from '@/pages/AppointmentPage'
import type { ClinicData } from '@/services/clinicApi'

type Props = AppointmentPageProps;

export default function AppointmentRoute({ lang, slug, clinicData }: Props) {
  return <AppointmentPage lang={lang} slug={slug} clinicData={clinicData} />
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
  const locales = ['uk', 'en']
  let clinics = readClinicsBuildFile()
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
      console.warn('Failed to fetch clinics in appointment getStaticPaths fallback:', e)
    }
  }
  const paths = []
  for (const lang of locales) {
    for (const c of clinics) {
      paths.push({ params: { lang, slug: c.slug } })
    }
  }
  if (paths.length === 0 && process.env.NODE_ENV !== 'production') {
    for (const lang of locales) {
      paths.push({ params: { lang, slug: 'my-clinic' } })
    }
  }
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = params?.lang as string || 'uk'
  const slug = params?.slug as string
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vet.digispace.pro'
  const frontendKey = process.env.NEXT_PUBLIC_FRONTEND_KEY || ''
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
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Clinic data for slug "${slug}" not found — rendering development stub for appointment`)
      const stub: ClinicData = {
        id: 0,
        tenant_id: '',
        color: '#90043c',
        clinic_name: slug,
        tagline: 'Demo clinic (development fallback)',
        enable_appointment_button: true,
        sections: [],
        slug,
        phone: '',
        email: undefined,
        address: '',
        logo_url: null,
        services: [],
        doctors: [],
        opening_hours: undefined,
        gallery: [],
        reviews: [],
        seo: { title: `${slug} | VetCard`, description: '', keywords: [], og_image: null },
      }
      return { props: { lang, slug, clinicData: stub } }
    }
    return { notFound: true }
  }
  return { props: { lang, slug, clinicData } }
}
