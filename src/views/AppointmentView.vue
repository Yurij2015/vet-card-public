<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ClinicData } from '@/services/clinicApi'
import PetsIcon from '@/assets/icons/pets.svg?raw'

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
const selectedTime = ref<string>('')
const name = ref('')
const phone = ref('')

// Use current date for calendar
const now = new Date()
const currentMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1))


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
  const today = new Date()
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

const prevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

// Initialize with today's date
selectedDate.value = new Date()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Desktop Layout -->
    <div class="hidden lg:block lg:h-screen lg:w-full overflow-auto">
      <div class="min-h-full w-full px-12 xl:px-16 2xl:px-20 py-8 flex flex-col">
        <!-- VetCard Logo - Fixed at top -->
        <div class="flex items-center justify-start gap-3 mb-8">
          <div class="h-8 w-8" :style="{ color: clinicData?.color || '#2563eb' }" v-html="PetsIcon"></div>
          <h1 class="text-3xl font-bold text-gray-900">VetCard</h1>
        </div>

        <!-- Main Content - Centered -->
        <div class="flex-1 flex flex-col justify-center">
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
            <h2 class="text-4xl xl:text-5xl font-bold text-gray-900">Make an Appointment</h2>
          </div>

          <!-- Grid Content -->
          <div class="grid lg:grid-cols-2 gap-12 xl:gap-16 max-w-5xl">
          <!-- Left Column: Calendar & Time -->
          <div class="space-y-8">
            <!-- Calendar -->
            <div>
              <div class="flex items-center justify-between mb-6">
                <button
                  @click="prevMonth"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 xl:w-6 xl:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h3 class="text-2xl xl:text-3xl font-bold text-gray-900">
                  {{ monthName }}
                </h3>
                <button
                  @click="nextMonth"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 xl:w-6 xl:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <div class="bg-white rounded-2xl p-6 xl:p-8 shadow-sm">
                <!-- Weekday Headers -->
                <div class="grid grid-cols-7 gap-2 mb-4">
                  <div
                    v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
                    :key="day"
                    class="text-center text-sm xl:text-base font-semibold text-gray-600"
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
                      'aspect-square flex items-center justify-center text-lg xl:text-xl rounded-full transition-all',
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
              <h3 class="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Select a Time</h3>
              <div class="grid grid-cols-2 gap-3 xl:gap-4">
                <button
                  v-for="slot in timeSlots"
                  :key="slot.time"
                  @click="selectTime(slot.time)"
                  :disabled="!slot.available"
                  :class="[
                    'py-4 px-6 rounded-xl font-semibold text-lg xl:text-xl transition-all',
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
              <h3 class="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Your Information</h3>
              <div class="space-y-4">
                <input
                  v-model="name"
                  type="text"
                  placeholder="Full Name"
                  class="w-full px-6 py-4 text-lg xl:text-xl border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                />
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="Phone Number"
                  class="w-full px-6 py-4 text-lg xl:text-xl border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-white"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                />
              </div>
            </div>

            <!-- Confirm Button -->
            <button
              @click="confirmAppointment"
              class="w-full text-white font-semibold text-xl xl:text-2xl py-5 px-8 rounded-2xl shadow-lg transition-all hover:opacity-90"
              :style="{ backgroundColor: clinicData?.color || '#2563eb' }"
            >
              Confirm Appointment
            </button>
          </div>
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
          <div class="flex items-center justify-between mb-6">
            <button
              @click="prevMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 class="text-2xl font-bold text-center text-gray-900">
              {{ monthName }}
            </h2>
            <button
              @click="nextMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

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
