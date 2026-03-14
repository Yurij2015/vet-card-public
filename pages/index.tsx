import type { GetStaticProps } from 'next'
import CatalogPage from '@/pages/CatalogPage'
import type { ClinicListItem } from '@/services/clinicApi'

interface Props {
  clinics: ClinicListItem[]
}

export default function IndexPage({ clinics }: Props) {
  return <CatalogPage clinics={clinics} />
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vet.digispace.pro'
  const frontendKey = process.env.NEXT_PUBLIC_FRONTEND_KEY || ''

  let clinics: ClinicListItem[] = []

  try {
    const res = await fetch(`${API_BASE_URL}/api/clinics/list`, {
      headers: { 'X-Frontend-Key': frontendKey },
    })
    if (res.ok) {
      const data = await res.json()
      clinics = data.data || data
    }
  } catch (e) {
    console.warn('Failed to fetch clinics for static generation:', e)
  }

  // Fallback to build-time data
  if (clinics.length === 0) {
    try {
      const fs = require('fs')
      const path = require('path')
      const buildDataPath = path.join(process.cwd(), 'src/data/clinics-build.json')
      if (fs.existsSync(buildDataPath)) {
        clinics = JSON.parse(fs.readFileSync(buildDataPath, 'utf-8'))
      }
    } catch {
      // ignore
    }
  }

  return { props: { clinics } }
}

