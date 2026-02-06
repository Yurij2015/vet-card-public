import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchClinicBySlug, type ClinicData } from '@/services/clinicApi'
import PetsIcon from '@/components/PetsIcon'

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

export default function AppointmentPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [clinicData, setClinicData] = useState<ClinicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [timeSlots] = useState<TimeSlot[]>(defaultTimeSlots)

  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  useEffect(() => {
    async function loadClinic() {
      if (!slug) return
      try {
        setLoading(true)
        const data = await fetchClinicBySlug(slug)
        setClinicData(data)
      } catch (err) {
        console.error('Error loading clinic:', err)
      } finally {
        setLoading(false)
      }
    }
    loadClinic()
  }, [slug])

  const themeColor = clinicData?.color || '#2563eb'

  const monthName = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [currentMonth])

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

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
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
    if (slug) {
      navigate(`/${slug}`)
    } else {
      navigate(-1)
    }
  }

  const confirmAppointment = () => {
    if (!selectedDate || !selectedTime || !name || !phone) {
      alert('Please fill in all fields')
      return
    }

    const appointment = {
      date: selectedDate,
      time: selectedTime,
      name,
      phone
    }

    console.log('Appointment confirmed:', appointment)
    alert('Appointment confirmed!')

    if (slug) {
      navigate(`/${slug}`)
    } else {
      navigate('/')
    }
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Book Appointment | {clinicData?.clinic_name || 'VetCard'}</title>
        <meta name="description" content={`Book an appointment at ${clinicData?.clinic_name || 'our veterinary clinic'}`} />
        <meta property="og:title" content={`Book Appointment | ${clinicData?.clinic_name || 'VetCard'}`} />
        <meta property="og:description" content={`Book an appointment at ${clinicData?.clinic_name || 'our veterinary clinic'}`} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:min-h-screen lg:w-full lg:flex-col lg:items-center lg:justify-center px-12 xl:px-16 2xl:px-20 py-8">
        <div className="w-full max-w-5xl">
          {/* VetCard Logo */}
          <div className="flex items-center justify-start gap-3 mb-8">
            <PetsIcon color={themeColor} className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-gray-900">VetCard</h1>
          </div>

          {/* Back Button & Title */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={goBack} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900">Make an Appointment</h2>
          </div>

          {/* Grid Content */}
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
            {/* Left Column: Calendar & Time */}
            <div className="space-y-8">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 xl:w-6 xl:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h3 className="text-2xl xl:text-3xl font-bold text-gray-900">{monthName}</h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 xl:w-6 xl:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-6 xl:p-8 shadow-sm">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className="text-center text-sm xl:text-base font-semibold text-gray-600">
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
                        className={`aspect-square flex items-center justify-center text-lg xl:text-xl rounded-full transition-all ${
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
                <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Select a Time</h3>
                <div className="grid grid-cols-2 gap-3 xl:gap-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-4 px-6 rounded-xl font-semibold text-lg xl:text-xl transition-all ${
                        selectedTime === slot.time && slot.available ? 'shadow-md' : ''
                      } ${
                        selectedTime !== slot.time && slot.available ? 'bg-white text-gray-900 border-2 border-gray-200' : ''
                      } ${
                        !slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                      }`}
                      style={selectedTime === slot.time && slot.available ? {
                        backgroundColor: themeColor,
                        color: 'white'
                      } : {}}
                      onMouseEnter={(e) => {
                        if (slot.available && selectedTime !== slot.time) {
                          (e.currentTarget as HTMLElement).style.borderColor = themeColor
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (slot.available && selectedTime !== slot.time) {
                          (e.currentTarget as HTMLElement).style.borderColor = ''
                        }
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: User Info & Confirm */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-6 py-4 text-lg xl:text-xl border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                    onFocus={(e) => e.target.style.borderColor = themeColor}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-6 py-4 text-lg xl:text-xl border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                    onFocus={(e) => e.target.style.borderColor = themeColor}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={confirmAppointment}
                className="w-full text-white font-semibold text-xl xl:text-2xl py-5 px-8 rounded-2xl shadow-lg transition-all hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={goBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Make an Appointment</h1>
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
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
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
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h3>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Full Name"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                onFocus={(e) => e.target.style.borderColor = themeColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone Number"
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
          >
            Confirm Appointment
          </button>
        </div>
      </div>
    </div>
  )
}
