import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { fetchClinicsList, type ClinicListItem } from '@/services/clinicApi'
import PetsIcon from '@/components/PetsIcon'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function CatalogPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clinics, setClinics] = useState<ClinicListItem[]>([])

  useDocumentMeta({
    title: t('seo.catalogTitle'),
    description: t('seo.catalogDescription'),
    keywords: t('seo.catalogKeywords'),
    ogTitle: t('seo.catalogTitle'),
    ogDescription: t('catalog.subtitle'),
    ogType: 'website',
  })

  useEffect(() => {
    async function loadClinics() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all clinics with catalog details
        const catalogData = await fetchClinicsList()
        setClinics(catalogData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clinics')
        console.error('Error loading clinics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadClinics()
  }, [])

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-xl text-gray-600">{t('catalog.loading')}</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('catalog.errorTitle')}</h2>
          <p className="text-lg text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PetsIcon color="#2563eb" className="h-10 w-10" />
              <h1 className="text-3xl font-bold text-gray-900">VetCard</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('catalog.title')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('catalog.subtitle')}
          </p>
        </div>

        {clinics.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p className="text-xl text-gray-600">{t('catalog.noClinics')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinics.map((clinic) => (
              <Link
                key={clinic.slug}
                to={`/${clinic.slug}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                {/* Card Header with Color */}
                <div
                  className="h-3"
                  style={{ backgroundColor: clinic.color }}
                />

                <div className="p-6">
                  {/* Logo and Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {clinic.logo_url ? (
                        <img
                          src={clinic.logo_url}
                          alt={clinic.clinic_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PetsIcon color={clinic.color} className="h-8 w-8" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {clinic.clinic_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {clinic.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {clinic.address && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span className="line-clamp-2">{clinic.address}</span>
                      </div>
                    )}
                    {clinic.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        <span>{clinic.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <div className="mt-6">
                    <span
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                      style={{ color: clinic.color }}
                    >
                      {t('catalog.viewClinic')}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <PetsIcon color="#9ca3af" className="h-6 w-6" />
            <span>{t('catalog.copyright')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
