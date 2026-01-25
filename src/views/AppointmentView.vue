<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  router.back()
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
  router.push('/')
}

// Initialize with April 23, 2024
selectedDate.value = new Date(2024, 3, 23)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
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
        <div class="bg-white rounded-xl p-4">
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
                'aspect-square flex items-center justify-center text-lg rounded-full transition-colors',
                {
                  'text-gray-900 hover:bg-gray-100': date && !isDateSelected(date) && !isToday(date),
                  'bg-blue-600 text-white font-semibold': date && isToday(date) && !isDateSelected(date),
                  'bg-blue-600 text-white font-semibold ring-4 ring-blue-200': date && isDateSelected(date),
                  'invisible': !date
                }
              ]"
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
                'bg-blue-600 text-white': selectedTime === slot.time && slot.available,
                'bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-600': selectedTime !== slot.time && slot.available,
                'bg-gray-100 text-gray-400 cursor-not-allowed': !slot.available
              }
            ]"
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
            class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors"
          />
          <input
            v-model="phone"
            type="tel"
            placeholder="Phone Number"
            class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      <!-- Confirm Button -->
      <button
        @click="confirmAppointment"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 px-6 rounded-xl shadow-sm transition-colors"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
