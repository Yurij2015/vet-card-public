/**
 * Prebuild script: fetches clinic list from API and saves to src/data/clinics-build.json.
 * This data is used by Next.js getStaticPaths/getStaticProps at build time.
 * Falls back to empty array if API is unavailable so the build always succeeds.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vet.digispace.pro'
const frontendKey = process.env.NEXT_PUBLIC_FRONTEND_KEY || ''

async function fetchClinics() {
  const url = `${API_BASE_URL}/api/clinics/list`
  console.log(`[prebuild] Fetching clinics from ${url}`)

  try {
    const response = await fetch(url, {
      headers: {
        'X-Frontend-Key': frontendKey,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    const data = await response.json()
    const clinics = data.data || data

    if (!Array.isArray(clinics)) {
      throw new Error('API response is not an array')
    }

    console.log(`[prebuild] Fetched ${clinics.length} clinics`)
    return clinics
  } catch (error) {
    console.warn(`[prebuild] Failed to fetch clinics: ${error.message}`)
    return null
  }
}

function saveClinicsData(clinics) {
  const dataDir = path.join(projectRoot, 'src', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Save full clinic list for getStaticProps
  const buildFilePath = path.join(dataDir, 'clinics-build.json')
  fs.writeFileSync(buildFilePath, JSON.stringify(clinics, null, 2))
  console.log(`[prebuild] Saved ${clinics.length} clinics to ${buildFilePath}`)

  // Also update clinicMapping.json (slug → tenant_domain) for runtime usage
  const mapping = {}
  for (const clinic of clinics) {
    if (clinic.slug && clinic.tenant_domain) {
      mapping[clinic.slug] = clinic.tenant_domain.startsWith('http')
        ? clinic.tenant_domain
        : `https://${clinic.tenant_domain}`
    }
  }
  const mappingPath = path.join(dataDir, 'clinicMapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))
  console.log(`[prebuild] Saved clinic mapping for ${Object.keys(mapping).length} clinics`)
}

async function main() {
  console.log('[prebuild] Starting clinic data fetch...')

  const clinics = await fetchClinics()

  if (clinics && clinics.length > 0) {
    saveClinicsData(clinics)
  } else {
    // Fallback: try to use existing build data
    const existingPath = path.join(projectRoot, 'src', 'data', 'clinics-build.json')
    if (fs.existsSync(existingPath)) {
      console.log('[prebuild] Using existing clinics-build.json as fallback')
    } else {
      // Create empty file so build doesn't break
      const dataDir = path.join(projectRoot, 'src', 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      fs.writeFileSync(existingPath, '[]')
      console.log('[prebuild] Created empty clinics-build.json fallback')
    }
  }

  console.log('[prebuild] Done.')
}

main().catch((err) => {
  console.error('[prebuild] Fatal error:', err)
  // Don't exit with error code so build continues with fallback data
  process.exit(0)
})

