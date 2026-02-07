import {fileURLToPath, URL} from 'node:url'
import {existsSync, mkdirSync, writeFileSync} from 'node:fs'
import path from 'node:path'

import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import puppeteerRenderer from '@prerenderer/renderer-puppeteer'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://vet.digispace.pro'

interface ClinicInfo {
  slug: string
  tenant_domain: string
}

// Функція для отримання роутів з API (викликається тільки при build)
async function getClinicRoutes(): Promise<{ routes: string[], clinics: ClinicInfo[] }> {
  // Fallback дані, якщо API недоступне
  const fallbackClinics: ClinicInfo[] = [
    { slug: 'my-clinic', tenant_domain: 'https://vet.digispace.pro' }
  ]
  const fallbackRoutes = ['/', '/my-clinic', '/my-clinic/appointment']

  try {
    // Отримуємо список клінік з їх slug та доменами тенантів
    const response = await fetch(`${API_BASE_URL}/api/clinics/list`)

    if (!response.ok) {
      console.warn(`API returned status ${response.status}, using fallback routes`)
      return { routes: fallbackRoutes, clinics: fallbackClinics }
    }

    const clinics: ClinicInfo[] = await response.json()

    if (clinics.length === 0) {
      console.warn('No clinics found in API response, using fallback routes')
      return { routes: fallbackRoutes, clinics: fallbackClinics }
    }

    const routes: string[] = ['/']

    for (const clinic of clinics) {
      routes.push(`/${clinic.slug}`)
      routes.push(`/${clinic.slug}/appointment`)
    }

    console.log(`Generated ${routes.length} routes for prerendering from ${clinics.length} clinics`)
    return { routes, clinics }
  } catch (error) {
    console.warn('Error fetching clinic routes from API, using fallback:', error)
    return { routes: fallbackRoutes, clinics: fallbackClinics }
  }
}

// Зберігаємо маппінг slug → tenant_domain для використання в runtime
function saveClinicMapping(clinics: ClinicInfo[]) {
  const mapping: Record<string, string> = {}
  for (const clinic of clinics) {
    // Додаємо https:// якщо домен не починається з http
    mapping[clinic.slug] = clinic.tenant_domain.startsWith('http')
        ? clinic.tenant_domain
        : `https://${clinic.tenant_domain}`
  }

  const dataDir = path.resolve(__dirname, 'src/data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  writeFileSync(
    path.join(dataDir, 'clinicMapping.json'),
    JSON.stringify(mapping, null, 2)
  )
  console.log(`Saved clinic mapping for ${clinics.length} clinics`)
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const isBuild = command === 'build'

  // Отримуємо роути та маппінг тільки при build
  let routes: string[] = []
  if (isBuild) {
    const result = await getClinicRoutes()
    routes = result.routes
    saveClinicMapping(result.clinics)
  }

  return {
    plugins: [
      react(),
      // Prerender плагін додається тільки при build
      ...(isBuild ? [
        prerender({
          routes,
          renderer: puppeteerRenderer,
          rendererOptions: {
            maxConcurrentRoutes: 1,
            renderAfterTime: 500,
          },
          postProcess(renderedRoute) {
            // Додаємо мета-теги для SEO
            renderedRoute.html = renderedRoute.html.replace(
              /<\/head>/,
              `<meta name="prerender-status-code" content="200" /></head>`
            )
          },
        }),
      ] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
