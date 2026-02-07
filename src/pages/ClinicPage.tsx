import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { fetchClinicBySlug, type ClinicData } from '@/services/clinicApi'
import PetsIcon from '@/components/PetsIcon'

const defaultServices = [
  { id: 1, name: 'Wellness Exams' },
  { id: 2, name: 'Vaccinations' },
  { id: 3, name: 'Dental Care' },
  { id: 4, name: 'Surgery' },
  { id: 5, name: 'Emergency Care' },
  { id: 6, name: 'Laboratory Services' }
]

const defaultDoctors = [
  { id: 1, name: 'Dr. Stacy Moreno', specialization: 'Veterinarian', photo_url: undefined },
  { id: 2, name: 'Dr. Edward Curtis', specialization: 'Veterinarian', photo_url: undefined }
]

export default function ClinicPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clinicInfo, setClinicInfo] = useState<ClinicData | null>(null)

  // Set document meta tags for SEO - must be called before any conditional returns
  useDocumentMeta({
    title: clinicInfo ? `${clinicInfo.clinic_name} | VetCard` : 'VetCard',
    description: clinicInfo?.tagline || (clinicInfo ? `${clinicInfo.clinic_name} - Veterinary Clinic` : 'Veterinary Clinic'),
    ogTitle: clinicInfo ? `${clinicInfo.clinic_name} | VetCard` : 'VetCard',
    ogDescription: clinicInfo?.tagline || (clinicInfo ? `${clinicInfo.clinic_name} - Veterinary Clinic` : 'Veterinary Clinic'),
    ogType: 'website',
    ogImage: clinicInfo?.logo_url || undefined,
    twitterCard: 'summary_large_image',
    twitterTitle: clinicInfo ? `${clinicInfo.clinic_name} | VetCard` : 'VetCard',
    twitterDescription: clinicInfo?.tagline || (clinicInfo ? `${clinicInfo.clinic_name} - Veterinary Clinic` : 'Veterinary Clinic'),
  })

  useEffect(() => {
    async function loadClinic() {
      if (!slug) {
        setError('No clinic slug provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await fetchClinicBySlug(slug)
        setClinicInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clinic data')
        console.error('Error loading clinic:', err)
      } finally {
        setLoading(false)
      }
    }

    loadClinic()
  }, [slug])

  const visibleSections = useMemo(() => {
    if (!clinicInfo?.sections) return []
    return clinicInfo.sections
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order)
  }, [clinicInfo?.sections])

  const isSectionVisible = (sectionId: string) => {
    if (!clinicInfo?.sections) return false
    const section = clinicInfo.sections.find(s => s.id === sectionId)
    return section?.visible ?? false
  }

  const formatOpeningHours = useMemo(() => {
    const hours = clinicInfo?.opening_hours
    if (!hours) return 'Mon – Fri  8:00 am – 6:00 pm'

    const hasConfiguredHours = Object.values(hours).some((day) => {
      return day.closed || day.open !== '09:00' || day.close !== '18:00'
    })

    if (!hasConfiguredHours) {
      return 'Mon – Fri  8:00 am – 6:00 pm'
    }

    const dayNames: Record<string, string> = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
      friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    }

    const closedDays = Object.entries(hours)
      .filter(([, day]) => day.closed)
      .map(([key]) => dayNames[key])
      .filter(Boolean)

    const openDays = Object.entries(hours).filter(([, day]) => !day.closed)

    if (openDays.length === 0) return 'Closed'

    const firstDay = openDays[0]
    if (!firstDay) return 'Mon – Fri  8:00 am – 6:00 pm'

    const firstOpenDay = firstDay[1]
    const hoursText = `${firstOpenDay.open} – ${firstOpenDay.close}`

    if (closedDays.length > 0) {
      return `Mon – Sun  ${hoursText}\n(Closed: ${closedDays.join(', ')})`
    }

    return `Mon – Sun  ${hoursText}`
  }, [clinicInfo?.opening_hours])

  const displayServices = useMemo(() => {
    if (clinicInfo?.services && clinicInfo.services.length > 0) {
      return clinicInfo.services
    }
    return defaultServices
  }, [clinicInfo?.services])

  const displayDoctors = useMemo(() => {
    if (clinicInfo?.doctors && clinicInfo.doctors.length > 0) {
      return clinicInfo.doctors
    }
    return defaultDoctors
  }, [clinicInfo?.doctors])

  const calculateAverageRating = () => {
    if (!clinicInfo?.reviews || clinicInfo.reviews.length === 0) return '4.8'
    const sum = clinicInfo.reviews.reduce((acc, review) => acc + review.rating, 0)
    const avg = sum / clinicInfo.reviews.length
    return avg.toFixed(1)
  }

  const getSectionTitle = (sectionId: string): string => {
    const titles: Record<string, string> = {
      services: 'Our Services',
      doctors: 'Our Veterinarians',
      openingHours: 'Opening Hours',
      gallery: 'Photo Gallery',
      reviews: 'Reviews'
    }
    return titles[sectionId] || 'Section'
  }

  const makeAppointment = () => {
    navigate(`/${slug}/appointment`)
  }

  const openMaps = () => {
    if (clinicInfo?.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(clinicInfo.address)}`, '_blank')
    }
  }

  const callClinic = () => {
    if (clinicInfo?.phone) {
      window.location.href = `tel:${clinicInfo.phone}`
    }
  }

  const sendEmail = () => {
    if (clinicInfo?.email) {
      window.location.href = `mailto:${clinicInfo.email}`
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-xl text-gray-600">Loading clinic information...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Clinic</h2>
          <p className="text-lg text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!clinicInfo) return null

  const themeColor = clinicInfo.color || '#2563eb'


  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50">
        {/* Desktop Layout */}
        <div className="hidden lg:block lg:h-screen lg:w-full overflow-auto">
          <div className="min-h-full w-full px-12 xl:px-16 2xl:px-20 py-8 flex flex-col">
            {/* VetCard Logo */}
            <div className="flex items-center justify-start gap-3 mb-8">
              <PetsIcon color={themeColor} className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-gray-900">VetCard</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Clinic Header */}
              <div className="text-center mb-12">
                <h2 className="text-5xl xl:text-6xl 2xl:text-6xl font-bold text-gray-900 mb-4">
                  {clinicInfo.clinic_name}
                </h2>
                <p className="text-xl xl:text-2xl text-gray-600 mb-8">
                  {clinicInfo.tagline}
                </p>
                {clinicInfo.enable_appointment_button && (
                  <button
                    onClick={makeAppointment}
                    className="hover:opacity-90 text-white font-semibold text-lg xl:text-xl py-4 xl:py-5 px-12 xl:px-16 rounded-2xl shadow-lg transition-all"
                    style={{ backgroundColor: themeColor }}
                  >
                    Make an Appointment
                  </button>
                )}
              </div>

              {/* Contact Info Row */}
              <div className="flex items-center justify-center gap-12 xl:gap-16 mb-12">
                <button
                  onClick={callClinic}
                  className="flex items-center gap-4 xl:gap-5 hover:opacity-70 transition-opacity"
                  style={{ color: themeColor }}
                >
                  <svg className="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="text-xl xl:text-2xl font-medium text-gray-900">{clinicInfo.phone || '(316) 555-0123'}</span>
                </button>

                {clinicInfo.email && (
                  <button
                    onClick={sendEmail}
                    className="flex items-center gap-4 xl:gap-5 hover:opacity-70 transition-opacity"
                    style={{ color: themeColor }}
                  >
                    <svg className="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-xl xl:text-2xl font-medium text-gray-900">{clinicInfo.email}</span>
                  </button>
                )}

                {clinicInfo.address && (
                  <button
                    onClick={openMaps}
                    className="flex items-center gap-4 xl:gap-5 hover:opacity-70 transition-opacity"
                    style={{ color: themeColor }}
                  >
                    <svg className="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-xl xl:text-2xl font-medium text-gray-900">{clinicInfo.address}</span>
                  </button>
                )}
              </div>

              {/* Three Column Layout */}
              <div className="grid grid-cols-3 gap-14 xl:gap-18 2xl:gap-20">
                {/* Opening Hours */}
                {isSectionVisible('openingHours') && (
                  <div>
                    <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Opening Hours</h3>
                    <p className="text-xl xl:text-xl text-gray-700 leading-relaxed whitespace-pre-line">{formatOpeningHours}</p>
                  </div>
                )}

                {/* Veterinarians */}
                <div>
                  <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-5">Our Veterinarians</h3>
                  <div className="space-y-5 xl:space-y-6">
                    {displayDoctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-center gap-5 xl:gap-6">
                        <div className="w-20 h-20 xl:w-24 xl:h-24 shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {doctor.photo_url ? (
                            <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl xl:text-2xl font-semibold text-gray-900">{doctor.name}</h4>
                          <p className="text-lg xl:text-xl text-gray-600">{doctor.specialization || 'Veterinarian'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
                  <ul className="space-y-3 xl:space-y-4">
                    {displayServices.map((service) => (
                      <li key={service.id} className="flex items-start gap-3 xl:gap-4 text-gray-700">
                        <span className="w-2 h-2 xl:w-2.5 xl:h-2.5 bg-gray-900 rounded-full flex-shrink-0 mt-2 xl:mt-2.5"></span>
                        <span className="text-lg xl:text-xl leading-snug">{service.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden bg-white">
          {/* VetCard Header */}
          <div className="bg-white px-6 py-6 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <PetsIcon color={themeColor} className="h-8 w-8" />
              <span className="text-base font-bold text-gray-800">VetCard</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{clinicInfo.clinic_name}</h1>
            <p className="mt-2 text-sm text-gray-600">{clinicInfo.tagline}</p>
          </div>

          {/* Appointment Button */}
          {clinicInfo.enable_appointment_button && (
            <div className="px-6 pb-4">
              <button
                onClick={makeAppointment}
                className="w-full rounded-lg py-3 text-base font-semibold text-white shadow-md"
                style={{ backgroundColor: themeColor }}
              >
                Make an Appointment
              </button>
            </div>
          )}

          {/* Contact Info */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <button onClick={callClinic} className="text-sm">{clinicInfo.phone || '(316) 555-0123'}</button>
            </div>
            {clinicInfo.email && (
              <div className="mt-3 flex items-center gap-3 text-gray-700">
                <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <button onClick={sendEmail} className="text-sm">{clinicInfo.email}</button>
              </div>
            )}
            {clinicInfo.address && (
              <div className="mt-3 flex items-start gap-3 text-gray-700">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <button onClick={openMaps} className="text-sm text-left">{clinicInfo.address}</button>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="px-6 pb-6">
            {/* Opening Hours */}
            {isSectionVisible('openingHours') && (
              <div className="border-t border-gray-100 py-5">
                <h3 className="mb-3 text-lg font-bold text-gray-900">Opening Hours</h3>
                <div className="text-sm text-gray-700">
                  <p className="whitespace-pre-line">{formatOpeningHours}</p>
                </div>
              </div>
            )}

            {/* Doctors */}
            <div className="border-t border-gray-100 py-5">
              <h3 className="mb-3 text-lg font-bold text-gray-900">Our Veterinarians</h3>
              <div className="space-y-3">
                {displayDoctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {doctor.photo_url ? (
                        <img src={doctor.photo_url} alt={doctor.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialization || 'Veterinarian'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="border-t border-gray-100 py-5">
              <h3 className="mb-3 text-lg font-bold text-gray-900">Our Services</h3>
              <div className="space-y-2">
                {displayServices.map((service) => (
                  <div key={service.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"></span>
                    <span>{service.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Sections */}
            {visibleSections
              .filter(s => s.id !== 'openingHours' && s.id !== 'doctors' && s.id !== 'services')
              .map((section) => (
                <div key={section.id} className="border-t border-gray-100 py-5">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">{getSectionTitle(section.id)}</h3>

                  {section.id === 'gallery' && (
                    <div>
                      {clinicInfo.gallery && clinicInfo.gallery.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {clinicInfo.gallery.slice(0, 3).map((photo, index) => (
                            <div key={photo.id || index} className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                              <img src={photo.url} alt={photo.title || 'Gallery image'} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="aspect-square rounded-lg bg-gray-200"></div>
                          <div className="aspect-square rounded-lg bg-gray-200"></div>
                          <div className="aspect-square rounded-lg bg-gray-200"></div>
                        </div>
                      )}
                    </div>
                  )}

                  {section.id === 'reviews' && (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="mb-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                          ))}
                          <span className="ml-2 text-gray-600">
                            {calculateAverageRating()} from {clinicInfo.reviews?.length || 127} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
