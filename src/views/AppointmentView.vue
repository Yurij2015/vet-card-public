<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ClinicData } from '@/services/clinicApi'

const router = useRouter()
const route = useRoute()

// Receive clinic data as a prop from parent ClinicView
const props = defineProps<{
  clinicData: ClinicData
}>()

interface TimeSlot {
  time: string
  available: boolean
}

const selectedDate = ref<Date | null>(null)
const selectedTime = ref<string>('9:00 AM')
const name = ref('John Doe')
const phone = ref('(555) 123-4567')

const currentMonth = ref(new Date(2024, 3, 1)) // April 2024


const timeSlots = ref<TimeSlot[]>([
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: true },
  { time: '1:00 PM', available: false },
  { time: '2:00 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '4:00 PM', available: true }
])

const monthName = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []
  const startDay = firstDay.getDay() // 0 = Sunday

  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }

  // Add days of month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day))
  }

  return days
})

const isDateSelected = (date: Date | null) => {
  if (!date || !selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
}

const isToday = (date: Date | null) => {
  if (!date) return false
  const today = new Date(2024, 3, 23) // April 23, 2024 (from mockup)
  return date.toDateString() === today.toDateString()
}

const selectDate = (date: Date | null) => {
  if (date) {
    selectedDate.value = date
  }
}

const selectTime = (time: string) => {
  selectedTime.value = time
}

const goBack = () => {
  const slug = route.params.slug as string
  if (slug) {
    router.push(`/${slug}`)
  } else {
    router.back()
  }
}

const confirmAppointment = () => {
  if (!selectedDate.value || !selectedTime.value || !name.value || !phone.value) {
    alert('Please fill in all fields')
    return
  }

  const appointment = {
    date: selectedDate.value,
    time: selectedTime.value,
    name: name.value,
    phone: phone.value
  }

  console.log('Appointment confirmed:', appointment)
  alert('Appointment confirmed!')

  const slug = route.params.slug as string
  if (slug) {
    router.push(`/${slug}`)
  } else {
    router.push('/')
  }
}

const handleInputFocus = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  if (target) {
    target.style.borderColor = props.clinicData?.color || '#2563eb'
  }
}

const handleInputBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  if (target) {
    target.style.borderColor = ''
  }
}

// Initialize with April 23, 2024
selectedDate.value = new Date(2024, 3, 23)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Desktop Layout -->
    <div class="hidden lg:block lg:min-h-screen">
      <div class="max-w-4xl mx-auto px-12 py-12">
        <!-- VetCard Logo -->
        <div class="flex items-center justify-start gap-3 mb-10">
          <svg class="w-10 h-10" :style="{ color: clinicData?.color || '#2563eb' }" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M382.825,304.576a131.562,131.562,0,0,0-253.65,0l-18.248,66.15A80,80,0,0,0,188.046,472H323.954a80,80,0,0,0,77.119-101.274Zm-20.682,116.5A47.638,47.638,0,0,1,323.954,440H188.046a48,48,0,0,1-46.272-60.765l18.248-66.149a99.563,99.563,0,0,1,191.956,0l18.248,66.149A47.636,47.636,0,0,1,362.143,421.08Z"/>
            <path d="M146.1,230.31c2.784-17.4-.908-36.027-10.4-52.463S111.92,148.9,95.463,142.611c-17.624-6.731-35.6-5.659-50.634,3.017C14.942,162.884,7.077,205.413,27.3,240.433c9.489,16.436,23.778,28.95,40.235,35.236a64.058,64.058,0,0,0,22.863,4.371,55.133,55.133,0,0,0,27.771-7.389C133.194,263.974,143.114,248.937,146.1,230.31Zm-31.6-5.058c-1.43,8.929-5.81,15.92-12.333,19.686S87.4,249,78.95,245.775c-9.613-3.671-18.115-11.251-23.941-21.342-11.2-19.4-8.538-42.8,5.82-51.092a23.483,23.483,0,0,1,11.847-3.058A31.951,31.951,0,0,1,84.044,172.5c9.613,3.673,18.115,11.252,23.941,21.343S116.124,215.091,114.5,225.252Z"/>
            <path d="M149.566,164.017c11.362,9.083,24.337,13.813,37.458,13.812a54.965,54.965,0,0,0,11.689-1.261c33.723-7.331,54.17-45.443,45.58-84.958h0c-4.03-18.546-13.828-34.817-27.588-45.818-14.735-11.78-32.189-16.239-49.147-12.551-33.722,7.33-54.169,45.442-45.58,84.957C126.009,136.745,135.807,153.016,149.566,164.017Zm24.788-99.506a22.258,22.258,0,0,1,4.732-.5c5.948,0,12.066,2.327,17.637,6.781,8.037,6.425,13.826,16.234,16.3,27.621h0c4.76,21.895-4.906,43.368-21.107,46.89-7.361,1.6-15.305-.628-22.367-6.275-8.037-6.426-13.826-16.235-16.3-27.621C148.488,89.506,158.154,68.033,174.354,64.511Z"/>
            <path d="M467.171,145.628c-15.028-8.676-33.013-9.748-50.634-3.017-16.457,6.287-30.746,18.8-40.235,35.236s-13.182,35.067-10.4,52.463c2.982,18.627,12.9,33.664,27.931,42.341a55.123,55.123,0,0,0,27.771,7.389,64.054,64.054,0,0,0,22.863-4.371c16.457-6.286,30.746-18.8,40.235-35.236C504.923,205.413,497.058,162.884,467.171,145.628Zm-10.18,78.805c-5.826,10.091-14.328,17.671-23.941,21.342-8.446,3.228-16.692,2.931-23.215-.837s-10.9-10.757-12.333-19.686c-1.626-10.161.686-21.314,6.513-31.4s14.328-17.67,23.941-21.343a31.955,31.955,0,0,1,11.368-2.221,23.483,23.483,0,0,1,11.847,3.058C465.529,181.631,468.194,205.028,456.991,224.433Z"/>
            <path d="M313.287,176.568a54.965,54.965,0,0,0,11.689,1.261c13.12,0,26.1-4.729,37.458-13.812,13.759-11,23.557-27.272,27.588-45.818,8.589-39.515-11.858-77.627-45.58-84.957-16.957-3.686-34.412.77-49.147,12.551-13.76,11-23.558,27.272-27.588,45.817C259.117,131.125,279.564,169.237,313.287,176.568Zm-14.31-78.16h0c2.474-11.387,8.263-21.2,16.3-27.621,5.572-4.454,11.689-6.781,17.637-6.781a22.258,22.258,0,0,1,4.732.5c16.2,3.522,25.866,25,21.107,46.89-2.476,11.387-8.265,21.2-16.3,27.622-7.061,5.646-15,7.874-22.367,6.275C303.883,141.776,294.217,120.3,298.977,98.408Z"/>
          </svg>
          <h1 class="text-3xl font-bold text-gray-900">VetCard</h1>
        </div>

        <!-- Back Button & Title -->
        <div class="flex items-center gap-4 mb-8">
          <button
            @click="goBack"
            class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="text-4xl font-bold text-gray-900">Make an Appointment</h2>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Left Column: Calendar & Time -->
          <div class="space-y-8">
            <!-- Calendar -->
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-6">
                {{ monthName }}
              </h3>

              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <!-- Weekday Headers -->
                <div class="grid grid-cols-7 gap-2 mb-4">
                  <div
                    v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
                    :key="day"
                    class="text-center text-sm font-semibold text-gray-600"
                  >
                    {{ day }}
                  </div>
                </div>

                <!-- Calendar Days -->
                <div class="grid grid-cols-7 gap-2">
                  <button
                    v-for="(date, index) in calendarDays"
                    :key="index"
                    @click="selectDate(date)"
                    :disabled="!date"
                    :class="[
                      'aspect-square flex items-center justify-center text-lg rounded-full transition-all',
                      {
                        'text-gray-900 hover:bg-gray-100': date && !isDateSelected(date) && !isToday(date),
                        'font-semibold': date && (isToday(date) || isDateSelected(date)),
                        'invisible': !date
                      }
                    ]"
                    :style="date && (isToday(date) || isDateSelected(date)) ? {
                      backgroundColor: clinicData?.color || '#2563eb',
                      color: 'white',
                      boxShadow: isDateSelected(date) ? `0 0 0 4px ${clinicData?.color ? clinicData.color + '33' : 'rgb(191 219 254)'}` : 'none'
                    } : {}"
                  >
                    {{ date ? date.getDate() : '' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Time Slots -->
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Select a Time</h3>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="slot in timeSlots"
                  :key="slot.time"
                  @click="selectTime(slot.time)"
                  :disabled="!slot.available"
                  :class="[
                    'py-4 px-6 rounded-xl font-semibold text-lg transition-all',
                    {
                      'shadow-md': selectedTime === slot.time && slot.available,
                      'bg-white text-gray-900 border-2 border-gray-200': selectedTime !== slot.time && slot.available,
                      'bg-gray-100 text-gray-400 cursor-not-allowed': !slot.available
                    }
                  ]"
                  :style="selectedTime === slot.time && slot.available ? {
                    backgroundColor: clinicData?.color || '#2563eb',
                    color: 'white'
                  } : {}"
                  @mouseenter="slot.available && selectedTime !== slot.time ? ($event.currentTarget as HTMLElement).style.borderColor = clinicData?.color || '#2563eb' : null"
                  @mouseleave="slot.available && selectedTime !== slot.time ? ($event.currentTarget as HTMLElement).style.borderColor = '' : null"
                >
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: User Info & Confirm -->
          <div class="space-y-8">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Your Information</h3>
              <div class="space-y-4">
                <input
                  v-model="name"
                  type="text"
                  placeholder="Full Name"
                  class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                />
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="Phone Number"
                  class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                />
              </div>
            </div>

            <!-- Confirm Button -->
            <button
              @click="confirmAppointment"
              class="w-full text-white font-semibold text-xl py-5 px-8 rounded-2xl shadow-lg transition-all hover:opacity-90"
              :style="{ backgroundColor: clinicData?.color || '#2563eb' }"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="lg:hidden">
      <!-- Header -->
      <div class="bg-white shadow-sm sticky top-0 z-10">
        <div class="max-w-md mx-auto px-6 py-4">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Make an Appointment</h1>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-md mx-auto px-6 py-6 space-y-8">
        <!-- Calendar -->
        <div>
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">
            {{ monthName }}
          </h2>

          <!-- Calendar Grid -->
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-2 mb-4">
              <div
                v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
                :key="day"
                class="text-center text-sm font-semibold text-gray-600"
              >
                {{ day }}
              </div>
            </div>

            <!-- Calendar Days -->
            <div class="grid grid-cols-7 gap-2">
              <button
                v-for="(date, index) in calendarDays"
                :key="index"
                @click="selectDate(date)"
                :disabled="!date"
                :class="[
                  'aspect-square flex items-center justify-center text-lg rounded-full transition-all',
                  {
                    'text-gray-900 hover:bg-gray-100': date && !isDateSelected(date) && !isToday(date),
                    'font-semibold': date && (isToday(date) || isDateSelected(date)),
                    'invisible': !date
                  }
                ]"
                :style="date && (isToday(date) || isDateSelected(date)) ? {
                  backgroundColor: clinicData?.color || '#2563eb',
                  color: 'white',
                  boxShadow: isDateSelected(date) ? `0 0 0 4px ${clinicData?.color ? clinicData.color + '33' : 'rgb(191 219 254)'}` : 'none'
                } : {}"
              >
                {{ date ? date.getDate() : '' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Time Slots -->
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Select a Time</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="slot in timeSlots"
              :key="slot.time"
              @click="selectTime(slot.time)"
              :disabled="!slot.available"
              :class="[
                'py-4 px-6 rounded-xl font-semibold text-lg transition-all',
                {
                  'shadow-md': selectedTime === slot.time && slot.available,
                  'bg-white text-gray-900 border-2 border-gray-200': selectedTime !== slot.time && slot.available,
                  'bg-gray-100 text-gray-400 cursor-not-allowed': !slot.available
                }
              ]"
              :style="selectedTime === slot.time && slot.available ? { backgroundColor: clinicData?.color || '#2563eb', color: 'white', borderColor: 'transparent' } : {}"
            >
              {{ slot.time }}
            </button>
          </div>
        </div>

        <!-- User Information -->
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Your Information</h3>
          <div class="space-y-3">
            <input
              v-model="name"
              type="text"
              placeholder="Full Name"
              class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
            <input
              v-model="phone"
              type="tel"
              placeholder="Phone Number"
              class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
          </div>
        </div>

        <!-- Confirm Button -->
        <button
          @click="confirmAppointment"
          class="w-full text-white font-semibold text-lg py-4 px-6 rounded-xl shadow-md transition-all hover:opacity-90"
          :style="{ backgroundColor: clinicData?.color || '#2563eb' }"
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
