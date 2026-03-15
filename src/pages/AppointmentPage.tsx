import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { createAppointment, type ClinicData } from '@/services/clinicApi'
import { saveAppointment } from '@/services/appointmentStorage'
import { getUserProfile, saveUserProfile } from '@/services/userStorage'
import PetsIcon from '@/components/PetsIcon'
import { useTranslation } from 'react-i18next'

interface TimeSlot {
  time: string
  available: boolean
}

const defaultTimeSlots: TimeSlot[] = [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: true },
  { time: '1:00 PM', available: false },
  { time: '2:00 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '4:00 PM', available: true }
]

const animalTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Other']
const petAgeOptions = ['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Unknown']

export interface AppointmentPageProps {
  lang: string
  slug: string
  clinicData: ClinicData
}

export default function AppointmentPage({ lang, slug, clinicData }: AppointmentPageProps) {
  const router = useRouter()
  const { i18n } = useTranslation()

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [timeSlots] = useState<TimeSlot[]>(defaultTimeSlots)

  // Form fields
  const [ownerName, setOwnerName] = useState('')
  const [petName, setPetName] = useState('')
  const [animalType, setAnimalType] = useState('')
  const [petAge, setPetAge] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [serviceReason, setServiceReason] = useState('')
  const [branchId, setBranchId] = useState<number | null>(null)

  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  // Load saved user profile on mount
  useEffect(() => {
    const savedProfile = getUserProfile()
    if (savedProfile) {
      setOwnerName(savedProfile.owner_name)
      setPhone(savedProfile.phone)
      setEmail(savedProfile.email)
    }
  }, [])

  // Auto-select first branch if only one exists
  useEffect(() => {
    if (clinicData?.branches && clinicData.branches.length === 1) {
      setBranchId(clinicData.branches[0].id)
    }
  }, [clinicData])

  // Set i18n language on mount for SSR/SSG hydration consistency
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  const themeColor = clinicData?.color || '#2563eb'

  const monthName = useMemo(() => {
    return currentMonth.toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-US', { month: 'long', year: 'numeric' })
  }, [currentMonth, lang])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    const startDay = firstDay.getDay()

    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentMonth])

  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const formatTime = (time: string) => {
    if (lang !== 'uk') return time
    const [t, meridiem] = time.split(' ')
    let [h, m] = t.split(':')
    let hour = parseInt(h, 10)
    if (meridiem === 'PM' && hour < 12) hour += 12
    if (meridiem === 'AM' && hour === 12) hour = 0
    return `${hour.toString().padStart(2, '0')}:${m}`
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const selectDate = (date: Date | null) => {
    if (date) setSelectedDate(date)
  }

  const goBack = () => {
    router.push(`/${slug}`)
  }

  const confirmAppointment = async () => {
    // Check if branch selection is required
    const hasBranches = clinicData?.branches && clinicData.branches.length > 0
    const needsBranchSelection = hasBranches && !branchId

    if (!selectedDate || !selectedTime || !ownerName || !petName || !animalType || !petAge || !phone || !email || !serviceReason || !clinicData) {
      alert('Please fill in all fields')
      return
    }

    if (needsBranchSelection) {
      alert('Please select a branch')
      return
    }

    // Parse time (e.g., "9:00 AM" -> hours and minutes)
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!timeMatch) {
      alert('Invalid time format')
      return
    }

    let hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    const isPM = timeMatch[3].toUpperCase() === 'PM'

    if (isPM && hours !== 12) hours += 12
    if (!isPM && hours === 12) hours = 0

    // Create appointment datetime
    const appointmentDate = new Date(selectedDate)
    appointmentDate.setHours(hours, minutes, 0, 0)

    const appointmentData = {
      owner_name: ownerName,
      pet_name: petName,
      animal_type: animalType,
      pet_age: petAge,
      phone: phone,
      email: email,
      service_reason: serviceReason,
      appointment_at: appointmentDate.toISOString(),
      status: 'draft' as const,
      ...(branchId && { branch_id: branchId }),
    }

    try {
      setSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)

          // Client-side email validation
          const emailRegex = /^\S+@\S+\.\S+$/
          if (!emailRegex.test(email)) {
            setSubmitError('Please enter a valid email address')
            setSubmitting(false)
            return
          }

      // Call the API to create the appointment using clinicData for tenant domain
      await createAppointment(clinicData, appointmentData)

      // Save user profile for future appointments
      saveUserProfile({
        owner_name: ownerName,
        phone: phone,
        email: email,
      })

      // Save appointment to localStorage for user's reference
      const selectedBranch = clinicData.branches?.find(b => b.id === branchId)
      saveAppointment({
        clinic_slug: clinicData.slug,
        clinic_name: clinicData.clinic_name,
        owner_name: ownerName,
        pet_name: petName,
        animal_type: animalType,
        pet_age: petAge,
        phone: phone,
        email: email,
        service_reason: serviceReason,
        appointment_at: appointmentDate.toISOString(),
        branch_id: branchId || undefined,
        branch_name: selectedBranch?.name,
        status: 'draft',
      })

      setSubmitSuccess(true)

      // Optionally, navigate to a success page or reset the form
      setTimeout(() => {
        router.push(`/${slug}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error confirming appointment:', error)
      // Prefer error.message (which we crafted in createAppointment) if available
      const msg = error?.message || 'Failed to confirm appointment. Please try again.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{i18n.t('appointmentPage.title')} | {clinicData?.clinic_name || 'VetCard'}</title>
        <meta name="description" content={i18n.t('appointmentPage.description')} />
        <meta property="og:title" content={`${i18n.t('appointmentPage.title')} | ${clinicData?.clinic_name || 'VetCard'}`} />
        <meta property="og:description" content={i18n.t('appointmentPage.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={clinicData?.seo?.og_image || clinicData?.logo_url || undefined} />
        <meta name="robots" content="noindex" />
      </Head>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <Link href={`/${lang}`} className="flex items-center gap-3">
                <PetsIcon color={themeColor} className="h-8 w-8" />
                <span className="text-2xl font-bold text-gray-900">VetCard</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  suppressHydrationWarning
                  href={`/${lang}/my-appointments`}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title={i18n.t('appointmentPage.myAppointments') || 'My Appointments'}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </Link>
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  <span suppressHydrationWarning className="font-medium">{i18n.t('appointmentPage.backToClinic') || 'Back to Clinic'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-8 py-12">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 suppressHydrationWarning className="text-4xl xl:text-5xl font-bold text-gray-900 mb-3">
              {i18n.t('appointmentPage.title')}
            </h1>
            {clinicData && (
              <p className="text-xl text-gray-600">
                {clinicData.clinic_name}
              </p>
            )}
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Calendar */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h3 className="text-2xl font-bold text-gray-900">{monthName}</h3>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {(lang === 'uk' ? ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, index) => (
                  <div key={index} className="text-center text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                    disabled={!date}
                    className={`aspect-square flex items-center justify-center text-lg rounded-full transition-all ${
                      !date ? 'invisible' : ''
                    } ${
                      date && !isDateSelected(date) && !isToday(date) ? 'text-gray-900 hover:bg-gray-100' : ''
                    } ${
                      date && (isToday(date) || isDateSelected(date)) ? 'font-semibold' : ''
                    }`}
                    style={date && (isToday(date) || isDateSelected(date)) ? {
                      backgroundColor: themeColor,
                      color: 'white',
                      boxShadow: isDateSelected(date) ? `0 0 0 4px ${themeColor}33` : 'none'
                    } : {}}
                  >
                    {date ? date.getDate() : ''}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="mt-8">
                <h4 suppressHydrationWarning className="text-xl font-bold text-gray-900 mb-4">{i18n.t('appointmentPage.labels.time') || 'Select a Time'}</h4>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-3 px-4 rounded-xl font-medium text-base transition-all ${
                        selectedTime === slot.time && slot.available ? 'shadow-md' : ''
                      } ${
                        selectedTime !== slot.time && slot.available ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : ''
                      } ${
                        !slot.available ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''
                      }`}
                      style={selectedTime === slot.time && slot.available ? {
                        backgroundColor: themeColor,
                        color: 'white'
                      } : {}}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="space-y-8">
              {/* Branch Selection */}
              {clinicData?.branches && clinicData.branches.length > 1 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h3 suppressHydrationWarning className="text-xl font-bold text-gray-900 mb-6">{i18n.t('appointmentPage.labels.branch') || 'Select Branch'}</h3>
                  <div className="space-y-3">
                    {clinicData.branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => setBranchId(branch.id)}
                        className={`w-full px-4 py-4 text-lg rounded-xl font-medium transition-all text-left ${
                          branchId === branch.id ? 'shadow-md' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={branchId === branch.id ? {
                          backgroundColor: themeColor,
                          color: 'white'
                        } : {}}
                      >
                        {branch.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 suppressHydrationWarning className="text-xl font-bold text-gray-900 mb-6">{i18n.t('appointmentPage.userInfo') || 'Your Information'}</h3>
                <div className="space-y-4">
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.ownerName')}</label>
                    <input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      type="text"
                      placeholder={i18n.t('appointmentPage.placeholders.ownerName') || "Enter owner's name"}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: ownerName ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!ownerName) e.target.style.borderColor = '' }}
                    />
                  </div>
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.petName')}</label>
                    <input
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      type="text"
                      placeholder={i18n.t('appointmentPage.placeholders.petName') || "Enter pet's name"}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: petName ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!petName) e.target.style.borderColor = '' }}
                    />
                  </div>
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.animalType')}</label>
                    <select
                      value={animalType}
                      onChange={(e) => setAnimalType(e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: animalType ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!animalType) e.target.style.borderColor = '' }}
                    >
                      <option value="">{i18n.t('appointmentPage.placeholders.selectAnimalType') || 'Select animal type'}</option>
                      {animalTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.petAge')}</label>
                    <select
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: petAge ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!petAge) e.target.style.borderColor = '' }}
                    >
                      <option value="">{i18n.t('appointmentPage.placeholders.selectPetAge') || 'Select pet age'}</option>
                      {petAgeOptions.map((age) => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.ownerPhone')}</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      placeholder={i18n.t('appointmentPage.placeholders.ownerPhone') || "Enter your phone"}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: phone ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!phone) e.target.style.borderColor = '' }}
                    />
                  </div>
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.ownerEmail')}</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder={i18n.t('appointmentPage.placeholders.ownerEmail') || "Enter your email"}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: email ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!email) e.target.style.borderColor = '' }}
                    />
                  </div>
                  <div>
                    <label suppressHydrationWarning className="block text-sm font-medium text-gray-700 mb-2">{i18n.t('appointmentPage.labels.serviceReason') || 'Reason for Visit'}</label>
                    <textarea
                      value={serviceReason}
                      onChange={(e) => setServiceReason(e.target.value)}
                      placeholder={i18n.t('appointmentPage.placeholders.serviceReason') || "Enter the reason for your visit"}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                      style={{ borderColor: serviceReason ? themeColor : '' }}
                      onFocus={(e) => e.target.style.borderColor = themeColor}
                      onBlur={(e) => { if (!serviceReason) e.target.style.borderColor = '' }}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {(selectedDate || selectedTime) && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h3 suppressHydrationWarning className="text-xl font-bold text-gray-900 mb-4">{i18n.t('appointmentPage.summary') || 'Appointment Summary'}</h3>
                  <div className="space-y-2 text-gray-700">
                    {selectedDate && (
                      <p><span className="font-medium">{i18n.t('appointmentPage.labels.date')}:</span> {selectedDate.toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    )}
                    {selectedTime && (
                      <p><span className="font-medium">{i18n.t('appointmentPage.labels.time')}:</span> {selectedTime}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={confirmAppointment}
                className="w-full text-white font-semibold text-xl py-4 px-8 rounded-xl shadow-md transition-all hover:opacity-90"
                style={{ backgroundColor: themeColor }}
                disabled={submitting}
              >
                {submitting ? i18n.t('appointmentPage.submitting') : i18n.t('appointmentPage.submit')}
              </button>

              {/* Submit Error Message */}
              {submitError && (
                <div className="text-red-600 text-center text-sm font-medium">
                  {submitError}
                </div>
              )}

              {/* Submit Success Message */}
              {submitSuccess && (
                <div className="text-green-600 text-center text-sm font-medium">
                  {i18n.t('appointmentPage.success') || 'Appointment confirmed successfully!'}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-center gap-3 text-gray-500">
              <PetsIcon color="#9ca3af" className="h-5 w-5" />
              <span className="text-sm">© 2026 VetCard. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={goBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 suppressHydrationWarning className="text-xl font-bold text-gray-900">{i18n.t('appointmentPage.title')}</h1>
              </div>
              <Link
                href="/my-appointments"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto px-6 py-6 space-y-8">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-center text-gray-900">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              {/* Weekday Headers */}
              <div suppressHydrationWarning className="grid grid-cols-7 gap-2 mb-4">
                {(lang === 'uk' ? ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, index) => (
                  <div key={index} className="text-center text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                    disabled={!date}
                    className={`aspect-square flex items-center justify-center text-lg rounded-full transition-all ${
                      !date ? 'invisible' : ''
                    } ${
                      date && !isDateSelected(date) && !isToday(date) ? 'text-gray-900 hover:bg-gray-100' : ''
                    } ${
                      date && (isToday(date) || isDateSelected(date)) ? 'font-semibold' : ''
                    }`}
                    style={date && (isToday(date) || isDateSelected(date)) ? {
                      backgroundColor: themeColor,
                      color: 'white',
                      boxShadow: isDateSelected(date) ? `0 0 0 4px ${themeColor}33` : 'none'
                    } : {}}
                  >
                    {date ? date.getDate() : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a Time</h3>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    selectedTime === slot.time && slot.available ? 'shadow-md' : ''
                  } ${
                    selectedTime !== slot.time && slot.available ? 'bg-white text-gray-900 border-2 border-gray-200' : ''
                  } ${
                    !slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  }`}
                  style={selectedTime === slot.time && slot.available ? {
                    backgroundColor: themeColor,
                    color: 'white',
                    borderColor: 'transparent'
                  } : {}}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          </div>

          {/* Branch Selection */}
          {clinicData?.branches && clinicData.branches.length > 1 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Select Branch</h3>
              <div className="space-y-3">
                {clinicData.branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setBranchId(branch.id)}
                    className={`w-full px-6 py-4 text-lg rounded-xl font-semibold transition-all text-left ${
                      branchId === branch.id ? 'shadow-md' : 'bg-white border-2 border-gray-200'
                    }`}
                    style={branchId === branch.id ? {
                      backgroundColor: themeColor,
                      color: 'white',
                      borderColor: 'transparent'
                    } : {}}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Information */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h3>
            <div className="space-y-3">
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                type="text"
                placeholder="Owner's Name"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                type="text"
                placeholder="Pet's Name"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              >
                <option value="">Select animal type</option>
                {animalTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              >
                <option value="">Select pet age</option>
                {petAgeOptions.map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone Number"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <textarea
                value={serviceReason}
                onChange={(e) => setServiceReason(e.target.value)}
                placeholder="Reason for Visit"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={confirmAppointment}
            className="w-full text-white font-semibold text-lg py-4 px-6 rounded-xl shadow-md transition-all hover:opacity-90"
            style={{ backgroundColor: themeColor }}
            disabled={submitting}
          >
            {submitting ? i18n.t('appointmentPage.submitting') : i18n.t('appointmentPage.submit')}
          </button>

          {/* Submit Error Message */}
          {submitError && (
            <div className="text-red-600 text-center text-sm font-medium">
              {submitError}
            </div>
          )}

          {/* Submit Success Message */}
          {submitSuccess && (
            <div className="text-green-600 text-center text-sm font-medium">
              Appointment confirmed successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
