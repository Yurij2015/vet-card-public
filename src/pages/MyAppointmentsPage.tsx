import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import {
  getSavedAppointments,
  removeAppointment,
  formatAppointmentDate,
  isAppointmentPast,
  type SavedAppointment
} from '@/services/appointmentStorage'
import PetsIcon from '@/components/PetsIcon'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function MyAppointmentsPage() {
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState<SavedAppointment[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useDocumentMeta({
    title: t('myAppointments.title') + ' | VetCard',
    description: t('myAppointments.subtitle'),
    robots: 'noindex',
  })

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = () => {
    setAppointments(getSavedAppointments())
  }

  const handleRemove = (id: string) => {
    if (confirm(t('myAppointments.removeConfirm'))) {
      removeAppointment(id)
      loadAppointments()
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') return !isAppointmentPast(apt.appointment_at)
    if (filter === 'past') return isAppointmentPast(apt.appointment_at)
    return true
  })

  const upcomingCount = appointments.filter(a => !isAppointmentPast(a.appointment_at)).length
  const pastCount = appointments.filter(a => isAppointmentPast(a.appointment_at)).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <PetsIcon color="#2563eb" className="h-8 w-8" />
              <span className="text-2xl font-bold text-gray-900">VetCard</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myAppointments.title')}</h1>
          <p className="text-gray-600">{t('myAppointments.subtitle')}</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('myAppointments.all')} ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('myAppointments.upcoming')} ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('myAppointments.past')} ({pastCount})
          </button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('myAppointments.noAppointments')}</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? t('myAppointments.noAppointmentsYet')
                : filter === 'upcoming'
                  ? t('myAppointments.noUpcoming')
                  : t('myAppointments.noPast')
              }
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {t('myAppointments.browseClinics')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const isPast = isAppointmentPast(apt.appointment_at)

              return (
                <div
                  key={apt.id}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isPast ? 'opacity-70' : ''}`}
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${isPast ? 'bg-gray-300' : 'bg-green-500'}`} />

                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            to={`/${apt.clinic_slug}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {apt.clinic_name}
                          </Link>
                          {isPast && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {t('myAppointments.past')}
                            </span>
                          )}
                        </div>

                        <p className="text-lg text-blue-600 font-medium mb-3">
                          {formatAppointmentDate(apt.appointment_at)}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span>{apt.owner_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PetsIcon color="#9ca3af" className="w-4 h-4" />
                            <span>{apt.pet_name} ({apt.animal_type})</span>
                          </div>
                          {apt.branch_name && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                              </svg>
                              <span>{apt.branch_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            <span>{apt.phone}</span>
                          </div>
                        </div>

                        {apt.service_reason && (
                          <p className="mt-3 text-sm text-gray-500">
                            <span className="font-medium">{t('myAppointments.reason')}:</span> {apt.service_reason}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2">
                        <Link
                          to={`/${apt.clinic_slug}`}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                        >
                          {t('myAppointments.viewClinic')}
                        </Link>
                        <button
                          onClick={() => handleRemove(apt.id)}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          {t('myAppointments.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Back to Catalog */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {t('myAppointments.backToCatalog')}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <PetsIcon color="#9ca3af" className="h-5 w-5" />
            <span className="text-sm">{t('catalog.copyright')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

