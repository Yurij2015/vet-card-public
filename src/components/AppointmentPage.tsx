import React, { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    // ...existing code...
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
  }

  const handleAnimalTypeChange = (type: string) => {
    setAnimalType(type)
  }

  const handlePetAgeChange = (age: string) => {
    setPetAge(age)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    switch (name) {
      case 'petName':
        setPetName(value)
        break
      case 'ownerName':
        setOwnerName(value)
        break
      case 'ownerEmail':
        setEmail(value)
        break
      case 'ownerPhone':
        setPhone(value)
        break
    }
  }

  const validateForm = () => {
    const errors: string[] = []
    if (!selectedDate) errors.push(i18n.t('appointmentPage.errors.dateRequired'))
    if (!selectedTime) errors.push(i18n.t('appointmentPage.errors.timeRequired'))
    if (!petName) errors.push(i18n.t('appointmentPage.errors.petNameRequired'))
    if (!ownerName) errors.push(i18n.t('appointmentPage.errors.ownerNameRequired'))
    if (!email) errors.push(i18n.t('appointmentPage.errors.ownerEmailRequired'))
    if (!phone) errors.push(i18n.t('appointmentPage.errors.ownerPhoneRequired'))
    setSubmitError(errors.length > 0 ? errors.join(', ') : null)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      // Compose appointment data as expected by backend
      const appointmentData = {
        clinic_slug: clinicData.slug,
        clinic_name: clinicData.clinic_name,
        owner_name: ownerName,
        pet_name: petName,
        animal_type: animalType,
        pet_age: petAge,
        phone: phone,
        email: email,
        service_reason: serviceReason,
        appointment_at: selectedDate ? selectedDate.toISOString() : '',
        branch_id: branchId || undefined,
        status: 'draft' as 'draft',
      }
      await createAppointment(clinicData, appointmentData)
      saveAppointment(appointmentData)
      saveUserProfile({ owner_name: ownerName, phone, email })
      setSubmitSuccess(true)
      await router.push(`/${lang}/appointment-success`)
    } catch (error) {
      setSubmitError(i18n.t('appointmentPage.errors.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderedTimeSlots = useMemo(() => {
    return timeSlots.map((slot) => (
      <button
        key={slot.time}
        onClick={() => handleTimeChange(slot.time)}
        disabled={!slot.available}
        className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}
      >
        {slot.time}
      </button>
    ))
  }, [timeSlots])

  return (
    <div className="appointment-page">
      <Head>
        <title>{i18n.t('appointmentPage.title')}</title>
        <meta name="description" content={i18n.t('appointmentPage.description')} />
      </Head>
      <h1 suppressHydrationWarning>{i18n.t('appointmentPage.title')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">{i18n.t('appointmentPage.labels.date')}</label>
          <input
            type="date"
            id="date"
            value={selectedDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">{i18n.t('appointmentPage.labels.time')}</label>
          <div className="time-slots">{renderedTimeSlots}</div>
        </div>
        <div className="form-group">
          <label htmlFor="petName">{i18n.t('appointmentPage.labels.petName')}</label>
          <input
            type="text"
            id="petName"
            name="petName"
            value={petName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="animalType">{i18n.t('appointmentPage.labels.animalType')}</label>
          <select
            id="animalType"
            value={animalType}
            onChange={(e) => handleAnimalTypeChange(e.target.value)}
            required
          >
            {animalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="petAge">{i18n.t('appointmentPage.labels.petAge')}</label>
          <select
            id="petAge"
            value={petAge}
            onChange={(e) => handlePetAgeChange(e.target.value)}
            required
          >
            {petAgeOptions.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="ownerName">{i18n.t('appointmentPage.labels.ownerName')}</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={ownerName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ownerEmail">{i18n.t('appointmentPage.labels.ownerEmail')}</label>
          <input
            type="email"
            id="ownerEmail"
            name="ownerEmail"
            value={email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ownerPhone">{i18n.t('appointmentPage.labels.ownerPhone')}</label>
          <input
            type="tel"
            id="ownerPhone"
            name="ownerPhone"
            value={phone}
            onChange={handleInputChange}
            required
          />
        </div>
        {submitError && (
          <div className="form-errors">
            <div className="error">
              {submitError}
            </div>
          </div>
        )}
        <button type="submit" disabled={submitting} className="submit-button">
          {submitting ? i18n.t('appointmentPage.submitting') : i18n.t('appointmentPage.submit')}
        </button>
      </form>
      <div className="back-to-home">
        <Link href={`/${lang}`} passHref>
          <button className="back-button">
            <PetsIcon />
            {i18n.t('appointmentPage.backToHome')}
          </button>
        </Link>
      </div>
    </div>
  )
}
