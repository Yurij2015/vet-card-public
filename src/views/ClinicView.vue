
<template>
  <div class="min-h-screen bg-white">
    <!-- Router view for nested routes (appointment) -->
    <router-view v-if="clinicInfo" :clinicData="clinicInfo" />

    <!-- Show clinic view only when not on nested route -->
    <template v-if="!$route.name || $route.name === 'clinic'">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p class="mt-4 text-xl text-gray-600">Loading clinic information...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-screen">
        <div class="text-center max-w-md mx-auto px-6">
          <svg class="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Clinic</h2>
          <p class="text-lg text-gray-600">{{ error }}</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="clinicInfo" class="bg-gray-50">
      <!-- Desktop Layout - Full Screen -->
      <div class="hidden lg:block lg:h-screen lg:w-full">
        <div class="h-full w-full px-12 xl:px-16 2xl:px-20 flex flex-col justify-center">
          <!-- VetCard Logo -->
          <div class="flex items-center justify-start gap-3 mb-10">
            <div class="h-8 w-8" :style="{ color: clinicInfo.color }" v-html="PetsIcon"></div>
            <h1 class="text-3xl font-bold text-gray-900">VetCard</h1>
          </div>

          <!-- Clinic Header -->
          <div class="text-center mb-12">
            <h2 class="text-5xl xl:text-6xl 2xl:text-6xl font-bold text-gray-900 mb-4">
              {{ clinicInfo.clinic_name }}
            </h2>
            <p class="text-xl xl:text-2xl text-gray-600 mb-8">
              {{ clinicInfo.tagline }}
            </p>
            <button
              v-if="clinicInfo.enable_appointment_button"
              @click="makeAppointment"
              class="hover:opacity-90 text-white font-semibold text-lg xl:text-xl py-4 xl:py-5 px-12 xl:px-16 rounded-2xl shadow-lg transition-all"
              :style="{ backgroundColor: clinicInfo.color || '#2563eb' }"
            >
              Make an Appointment
            </button>
          </div>

          <!-- Contact Info Row -->
          <div class="flex items-center justify-center gap-12 xl:gap-16 mb-12">
            <button
              @click="callClinic"
              class="flex items-center gap-4 xl:gap-5 hover:opacity-70 transition-opacity"
              :style="{ color: clinicInfo.color || '#2563eb' }"
            >
              <svg class="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span class="text-xl xl:text-2xl font-medium text-gray-900">{{ clinicInfo.phone || '(316) 555-0123' }}</span>
            </button>

            <button
              v-if="clinicInfo.email"
              @click="sendEmail"
              class="flex items-center gap-4 xl:gap-5 hover:opacity-70 transition-opacity"
              :style="{ color: clinicInfo.color || '#2563eb' }"
            >
              <svg class="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="text-xl xl:text-2xl font-medium text-gray-900">{{ clinicInfo.email }}</span>
            </button>

            <button
              v-if="clinicInfo.address"
              @click="openMaps"
              class="flex items-center gap-4 xl:gap-5 hover:opacity-70 transition-opacity"
              :style="{ color: clinicInfo.color || '#2563eb' }"
            >
              <svg class="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-xl xl:text-2xl font-medium text-gray-900">{{ clinicInfo.address }}</span>
            </button>
          </div>

          <!-- Three Column Layout -->
          <div class="grid grid-cols-3 gap-14 xl:gap-18 2xl:gap-20">
            <!-- Opening Hours -->
            <div v-if="isSectionVisible('openingHours')">
              <h3 class="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Opening Hours</h3>
              <p class="text-xl xl:text-xl text-gray-700 leading-relaxed whitespace-pre-line">{{ formatOpeningHours }}</p>
            </div>

            <!-- Veterinarians -->
            <div>
              <h3 class="text-2xl xl:text-3xl font-bold text-gray-900 mb-5">Our Veterinarians</h3>
              <div class="space-y-5 xl:space-y-6">
                <div
                  v-for="doctor in displayDoctors"
                  :key="doctor.id"
                  class="flex items-center gap-5 xl:gap-6"
                >
                  <div class="w-20 h-20 xl:w-24 xl:h-24 shrink-0 overflow-hidden rounded-full bg-gray-200">
                    <img
                      v-if="doctor.photo_url"
                      :src="doctor.photo_url"
                      :alt="doctor.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                      <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xl xl:text-2xl font-semibold text-gray-900">{{ doctor.name }}</h4>
                    <p class="text-lg xl:text-xl text-gray-600">{{ doctor.specialization || 'Veterinarian' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Services -->
            <div>
              <h3 class="text-2xl xl:text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
              <ul class="space-y-3 xl:space-y-4">
                <li
                  v-for="service in displayServices"
                  :key="service.id"
                  class="flex items-start gap-3 xl:gap-4 text-gray-700"
                >
                  <span class="w-2 h-2 xl:w-2.5 xl:h-2.5 bg-gray-900 rounded-full flex-shrink-0 mt-2 xl:mt-2.5"></span>
                  <span class="text-lg xl:text-xl leading-snug">{{ service.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="lg:hidden bg-white">
        <!-- VetCard Header -->
        <div class="bg-white px-6 py-6 text-center">
          <!-- VetCard Logo -->
          <div class="mb-4 flex items-center justify-center gap-2">
            <svg class="h-8 w-8" :style="{ color: clinicInfo.color || '#2563eb' }" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M382.825,304.576a131.562,131.562,0,0,0-253.65,0l-18.248,66.15A80,80,0,0,0,188.046,472H323.954a80,80,0,0,0,77.119-101.274Zm-20.682,116.5A47.638,47.638,0,0,1,323.954,440H188.046a48,48,0,0,1-46.272-60.765l18.248-66.149a99.563,99.563,0,0,1,191.956,0l18.248,66.149A47.636,47.636,0,0,1,362.143,421.08Z"/>
              <path d="M146.1,230.31c2.784-17.4-.908-36.027-10.4-52.463S111.92,148.9,95.463,142.611c-17.624-6.731-35.6-5.659-50.634,3.017C14.942,162.884,7.077,205.413,27.3,240.433c9.489,16.436,23.778,28.95,40.235,35.236a64.058,64.058,0,0,0,22.863,4.371,55.133,55.133,0,0,0,27.771-7.389C133.194,263.974,143.114,248.937,146.1,230.31Zm-31.6-5.058c-1.43,8.929-5.81,15.92-12.333,19.686S87.4,249,78.95,245.775c-9.613-3.671-18.115-11.251-23.941-21.342-11.2-19.4-8.538-42.8,5.82-51.092a23.483,23.483,0,0,1,11.847-3.058A31.951,31.951,0,0,1,84.044,172.5c9.613,3.673,18.115,11.252,23.941,21.343S116.124,215.091,114.5,225.252Z"/>
              <path d="M149.566,164.017c11.362,9.083,24.337,13.813,37.458,13.812a54.965,54.965,0,0,0,11.689-1.261c33.723-7.331,54.17-45.443,45.58-84.958h0c-4.03-18.546-13.828-34.817-27.588-45.818-14.735-11.78-32.189-16.239-49.147-12.551-33.722,7.33-54.169,45.442-45.58,84.957C126.009,136.745,135.807,153.016,149.566,164.017Zm24.788-99.506a22.258,22.258,0,0,1,4.732-.5c5.948,0,12.066,2.327,17.637,6.781,8.037,6.425,13.826,16.234,16.3,27.621h0c4.76,21.895-4.906,43.368-21.107,46.89-7.361,1.6-15.305-.628-22.367-6.275-8.037-6.426-13.826-16.235-16.3-27.621C148.488,89.506,158.154,68.033,174.354,64.511Z"/>
              <path d="M467.171,145.628c-15.028-8.676-33.013-9.748-50.634-3.017-16.457,6.287-30.746,18.8-40.235,35.236s-13.182,35.067-10.4,52.463c2.982,18.627,12.9,33.664,27.931,42.341a55.123,55.123,0,0,0,27.771,7.389,64.054,64.054,0,0,0,22.863-4.371c16.457-6.286,30.746-18.8,40.235-35.236C504.923,205.413,497.058,162.884,467.171,145.628Zm-10.18,78.805c-5.826,10.091-14.328,17.671-23.941,21.342-8.446,3.228-16.692,2.931-23.215-.837s-10.9-10.757-12.333-19.686c-1.626-10.161.686-21.314,6.513-31.4s14.328-17.67,23.941-21.343a31.955,31.955,0,0,1,11.368-2.221,23.483,23.483,0,0,1,11.847,3.058C465.529,181.631,468.194,205.028,456.991,224.433Z"/>
              <path d="M313.287,176.568a54.965,54.965,0,0,0,11.689,1.261c13.12,0,26.1-4.729,37.458-13.812,13.759-11,23.557-27.272,27.588-45.818,8.589-39.515-11.858-77.627-45.58-84.957-16.957-3.686-34.412.77-49.147,12.551-13.76,11-23.558,27.272-27.588,45.817C259.117,131.125,279.564,169.237,313.287,176.568Zm-14.31-78.16h0c2.474-11.387,8.263-21.2,16.3-27.621,5.572-4.454,11.689-6.781,17.637-6.781a22.258,22.258,0,0,1,4.732.5c16.2,3.522,25.866,25,21.107,46.89-2.476,11.387-8.265,21.2-16.3,27.622-7.061,5.646-15,7.874-22.367,6.275C303.883,141.776,294.217,120.3,298.977,98.408Z"/>
            </svg>
            <span class="text-base font-bold text-gray-800">VetCard</span>
          </div>

          <!-- Clinic Name -->
          <h1 class="text-2xl font-bold text-gray-900">{{ clinicInfo.clinic_name }}</h1>
          <p class="mt-2 text-sm text-gray-600">{{ clinicInfo.tagline }}</p>
        </div>

        <!-- Appointment Button -->
        <div v-if="clinicInfo.enable_appointment_button" class="px-6 pb-4">
          <button
            @click="makeAppointment"
            class="w-full rounded-lg py-3 text-base font-semibold text-white shadow-md"
            :style="{ backgroundColor: clinicInfo.color || '#2563eb' }"
          >
            Make an Appointment
          </button>
        </div>

        <!-- Contact Info -->
        <div class="border-t border-gray-100 px-6 py-4">
          <div class="flex items-center gap-3 text-gray-700">
            <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <button @click="callClinic" class="text-sm">{{ clinicInfo.phone || '(316) 555-0123' }}</button>
          </div>
          <div v-if="clinicInfo.email" class="mt-3 flex items-center gap-3 text-gray-700">
            <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <button @click="sendEmail" class="text-sm">{{ clinicInfo.email }}</button>
          </div>
          <div v-if="clinicInfo.address" class="mt-3 flex items-start gap-3 text-gray-700">
            <svg class="mt-0.5 h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <button @click="openMaps" class="text-sm text-left">{{ clinicInfo.address }}</button>
          </div>
        </div>

        <!-- Sections -->
        <div class="px-6 pb-6">
          <!-- Opening Hours (only if visible) -->
          <div v-if="isSectionVisible('openingHours')" class="border-t border-gray-100 py-5 first:border-t-0">
            <h3 class="mb-3 text-lg font-bold text-gray-900">Opening Hours</h3>
            <div class="text-sm text-gray-700">
              <p class="whitespace-pre-line">{{ formatOpeningHours }}</p>
            </div>
          </div>

          <!-- Doctors (always show with API or default data) -->
          <div class="border-t border-gray-100 py-5 first:border-t-0">
            <h3 class="mb-3 text-lg font-bold text-gray-900">Our Veterinarians</h3>
            <div class="space-y-3">
              <div
                v-for="doctor in displayDoctors"
                :key="doctor.id"
                class="flex items-center gap-3"
              >
                <div class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                  <img
                    v-if="doctor.photo_url"
                    :src="doctor.photo_url"
                    :alt="doctor.name"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ doctor.name }}</p>
                  <p class="text-sm text-gray-600">{{ doctor.specialization || 'Veterinarian' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Services (always show with API or default data) -->
          <div class="border-t border-gray-100 py-5">
            <h3 class="mb-3 text-lg font-bold text-gray-900">Our Services</h3>
            <div class="space-y-2">
              <div
                v-for="service in displayServices"
                :key="service.id"
                class="flex items-start gap-2 text-sm text-gray-700"
              >
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"></span>
                <span>{{ service.name }}</span>
              </div>
            </div>
          </div>

          <!-- Other visible sections (gallery, reviews, etc) -->
          <div
            v-for="section in visibleSections.filter(s => s.id !== 'openingHours' && s.id !== 'doctors' && s.id !== 'services')"
            :key="section.id"
            class="border-t border-gray-100 py-5"
          >
            <h3 class="mb-3 text-lg font-bold text-gray-900">
              {{ getSectionTitle(section.id) }}
            </h3>

            <!-- Gallery Section -->
            <div v-if="section.id === 'gallery'">
              <div v-if="clinicInfo.gallery && clinicInfo.gallery.length > 0" class="grid grid-cols-3 gap-2">
                <div
                  v-for="(photo, index) in clinicInfo.gallery.slice(0, 3)"
                  :key="photo.id || index"
                  class="aspect-square overflow-hidden rounded-lg bg-gray-200"
                >
                  <img :src="photo.url" :alt="photo.title || 'Gallery image'" class="h-full w-full object-cover" />
                </div>
              </div>
              <div v-else class="grid grid-cols-3 gap-2">
                <div class="aspect-square rounded-lg bg-gray-200"></div>
                <div class="aspect-square rounded-lg bg-gray-200"></div>
                <div class="aspect-square rounded-lg bg-gray-200"></div>
              </div>
            </div>

            <!-- Reviews Section -->
            <div v-else-if="section.id === 'reviews'" class="space-y-3">
              <div class="text-sm">
                <div class="mb-1 flex items-center gap-1">
                  <span v-for="i in 5" :key="i" class="text-yellow-400">⭐</span>
                  <span class="ml-2 text-gray-600">
                    {{ calculateAverageRating() }} from {{ clinicInfo.reviews?.length || 127 }} reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchClinicBySlug, type ClinicData } from '@/services/clinicApi'
import PetsIcon from '@/assets/icons/pets.svg?raw'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)

const clinicInfo = ref<ClinicData | null>(null)

// Get visible sections sorted by order
const visibleSections = computed(() => {
  if (!clinicInfo.value || !clinicInfo.value.sections) return []
  return clinicInfo.value.sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)
})

// Check if a section is visible
const isSectionVisible = (sectionId: string) => {
  if (!clinicInfo.value || !clinicInfo.value.sections) return false
  const section = clinicInfo.value.sections.find(s => s.id === sectionId)
  return section?.visible ?? false
}

// Get section title
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

// Format opening hours for display
const formatOpeningHours = computed(() => {
  const hours = clinicInfo.value?.opening_hours
  if (!hours) return 'Mon – Fri  8:00 am – 6:00 pm'

  // Check if any day has been configured
  const hasConfiguredHours = Object.values(hours).some((day: any) => {
    return day.closed || day.open !== '09:00' || day.close !== '18:00'
  })

  if (!hasConfiguredHours) {
    return 'Mon – Fri  8:00 am – 6:00 pm'
  }

  // Map of day keys to short names
  const dayNames: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  }

  // Find closed days
  const closedDays = Object.entries(hours)
    .filter(([, day]: [string, any]) => day.closed)
    .map(([key]) => dayNames[key])
    .filter(Boolean)

  // Find open days with their hours
  const openDays = Object.entries(hours)
    .filter(([, day]: [string, any]) => !day.closed)

  if (openDays.length === 0) {
    return 'Closed'
  }

  // Use first open day's hours as representative
  const firstDay = openDays[0]
  if (!firstDay) return 'Mon – Fri  8:00 am – 6:00 pm'

  const firstOpenDay: any = firstDay[1]
  const hoursText = `${firstOpenDay.open} – ${firstOpenDay.close}`

  // If there are closed days, show them in brackets
  if (closedDays.length > 0) {
    return `Mon – Sun  ${hoursText}\n(Closed: ${closedDays.join(', ')})`
  }

  return `Mon – Sun  ${hoursText}`
})

// Calculate average rating
const calculateAverageRating = () => {
  if (!clinicInfo.value?.reviews || clinicInfo.value.reviews.length === 0) return '4.8'
  const sum = clinicInfo.value.reviews.reduce((acc, review) => acc + review.rating, 0)
  const avg = sum / clinicInfo.value.reviews.length
  return avg.toFixed(1)
}

// Computed property for services to display
const displayServices = computed(() => {
  if (clinicInfo.value?.services && clinicInfo.value.services.length > 0) {
    return clinicInfo.value.services
  }
  // Return default services if no API data
  return [
    { id: 1, name: 'Wellness Exams' },
    { id: 2, name: 'Vaccinations' },
    { id: 3, name: 'Dental Care' },
    { id: 4, name: 'Surgery' },
    { id: 5, name: 'Emergency Care' },
    { id: 6, name: 'Laboratory Services' }
  ]
})

// Computed property for doctors to display
const displayDoctors = computed(() => {
  if (clinicInfo.value?.doctors && clinicInfo.value.doctors.length > 0) {
    return clinicInfo.value.doctors
  }
  // Return default doctors if no API data
  return [
    { id: 1, name: 'Dr. Stacy Moreno', specialization: 'Veterinarian', photo_url: null },
    { id: 2, name: 'Dr. Edward Curtis', specialization: 'Veterinarian', photo_url: null }
  ]
})

onMounted(async () => {
  const slug = route.params.slug as string

  if (!slug) {
    error.value = 'No clinic slug provided'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    clinicInfo.value = await fetchClinicBySlug(slug)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load clinic data'
    console.error('Error loading clinic:', err)
  } finally {
    loading.value = false
  }
})

const makeAppointment = () => {
  const slug = route.params.slug as string
  router.push(`/${slug}/appointment`)
}

const openMaps = () => {
  if (clinicInfo.value?.address) {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(clinicInfo.value.address)}`, '_blank')
  }
}

const callClinic = () => {
  if (clinicInfo.value?.phone) {
    window.location.href = `tel:${clinicInfo.value.phone}`
  }
}

const sendEmail = () => {
  if (clinicInfo.value?.email) {
    window.location.href = `mailto:${clinicInfo.value.email}`
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
