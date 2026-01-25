<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const clinicInfo = ref({
  name: 'Greenwood Veterinary Clinic',
  tagline: 'Quality care for your furry friends',
  phone: '(316) 555-0123',
  address: '721 Elm St, Greenwood, MO',
  hours: 'Mon – Fri   8:00 am – 6:00 pm',
  veterinarians: [
    {
      name: 'Dr. Stacy Moreno',
      title: 'Veterinarian',
      image: 'https://via.placeholder.com/80'
    },
    {
      name: 'Dr. Edward Curtis',
      title: 'Veterinarian',
      image: 'https://via.placeholder.com/80'
    }
  ],
  services: [
    'Wellness Exams',
    'Vaccinations',
    'Dental Care',
    'Surgery',
    'Emergency Care',
    'Laboratory Services'
  ]
})

const makeAppointment = () => {
  router.push('/appointment')
}

const openMaps = () => {
  window.open(`https://maps.google.com/?q=${encodeURIComponent(clinicInfo.value.address)}`, '_blank')
}

const callClinic = () => {
  window.location.href = `tel:${clinicInfo.value.phone}`
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
    <!-- Desktop Layout - Premium Full Screen -->
    <div class="hidden lg:flex lg:h-screen lg:w-full items-center">
      <div class="w-full max-w-6xl 2xl:max-w-7xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-2xl px-16 xl:px-20 2xl:px-24 py-14 flex flex-col">
        <!-- VetCard Logo -->
        <div class="flex items-center gap-3 mb-10">
          <svg class="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C9.243 2 7 4.243 7 7c0 2.197 1.437 4.069 3.432 4.735-.833.455-1.592.976-2.25 1.542C5.77 15.343 4 18.384 4 22h16c0-3.616-1.77-6.657-4.182-8.723-.658-.566-1.417-1.087-2.25-1.542C15.563 11.069 17 9.197 17 7c0-2.757-2.243-5-5-5z"/>
            <circle cx="9" cy="9" r="1"/>
            <circle cx="15" cy="9" r="1"/>
          </svg>
          <h1 class="text-3xl font-bold text-gray-900">VetCard</h1>
        </div>

        <!-- Clinic Header -->
        <div class="text-center mb-14">
          <h2 class="text-6xl xl:text-7xl font-extrabold text-gray-900 mb-5">
            {{ clinicInfo.name }}
          </h2>
          <p class="text-2xl xl:text-3xl text-gray-600 mb-10">
            {{ clinicInfo.tagline }}
          </p>
          <button
            @click="makeAppointment"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xl xl:text-2xl py-5 px-18 xl:px-20 rounded-2xl shadow-lg shadow-blue-200 transition-colors"
          >
            Make an Appointment
          </button>
        </div>

        <!-- Contact Info Row -->
        <div class="flex items-center justify-center gap-14 xl:gap-18 mb-14">
          <button
            @click="callClinic"
            class="flex items-center gap-4 xl:gap-5 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <svg class="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span class="text-2xl font-medium">{{ clinicInfo.phone }}</span>
          </button>

          <button
            @click="openMaps"
            class="flex items-center gap-4 xl:gap-5 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <svg class="w-7 h-7 xl:w-8 xl:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-2xl font-medium">{{ clinicInfo.address }}</span>
          </button>
        </div>

        <!-- Three Column Layout -->
        <div class="grid grid-cols-3 gap-14 xl:gap-18 2xl:gap-20">
          <!-- Opening Hours -->
          <div>
            <h3 class="text-3xl font-bold text-gray-900 mb-4">Opening Hours</h3>
            <p class="text-xl xl:text-2xl text-gray-700 leading-relaxed">{{ clinicInfo.hours }}</p>
          </div>

          <!-- Veterinarians -->
          <div>
            <h3 class="text-3xl font-bold text-gray-900 mb-5">Our Veterinarians</h3>
            <div class="space-y-5 xl:space-y-6">
              <div
                v-for="vet in clinicInfo.veterinarians"
                :key="vet.name"
                class="flex items-center gap-5 xl:gap-6"
              >
                <img
                  :src="vet.image"
                  :alt="vet.name"
                  class="w-20 h-20 xl:w-22 xl:h-22 rounded-full object-cover shadow-md"
                />
                <div>
                  <h4 class="text-2xl font-semibold text-gray-900">{{ vet.name }}</h4>
                  <p class="text-lg xl:text-xl text-gray-600">{{ vet.title }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
            <ul class="grid grid-cols-2 gap-x-5 xl:gap-x-6 gap-y-3 xl:gap-y-4">
              <li
                v-for="service in clinicInfo.services"
                :key="service"
                class="flex items-start gap-3 xl:gap-4 text-gray-700"
              >
                <span class="w-2 h-2 xl:w-2.5 xl:h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2 xl:mt-2.5"></span>
                <span class="text-xl xl:text-xl leading-snug">{{ service }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="lg:hidden">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="max-w-md mx-auto px-6 py-6">
          <div class="flex items-center justify-center gap-2 mb-6">
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C9.243 2 7 4.243 7 7c0 2.197 1.437 4.069 3.432 4.735-.833.455-1.592.976-2.25 1.542C5.77 15.343 4 18.384 4 22h16c0-3.616-1.77-6.657-4.182-8.723-.658-.566-1.417-1.087-2.25-1.542C15.563 11.069 17 9.197 17 7c0-2.757-2.243-5-5-5z"/>
              <circle cx="9" cy="9" r="1"/>
              <circle cx="15" cy="9" r="1"/>
            </svg>
            <h1 class="text-2xl font-bold text-gray-900">VetCard</h1>
          </div>

          <h2 class="text-3xl font-bold text-center text-gray-900 mb-2">
            {{ clinicInfo.name }}
          </h2>
          <p class="text-center text-gray-600 mb-6">
            {{ clinicInfo.tagline }}
          </p>

          <button
            @click="makeAppointment"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-sm transition-colors mb-6"
          >
            Make an Appointment
          </button>

          <!-- Contact Info -->
          <div class="space-y-4">
            <button
              @click="callClinic"
              class="w-full flex items-center gap-3 text-left"
            >
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span class="text-lg text-gray-900">{{ clinicInfo.phone }}</span>
            </button>

            <div
              @click="openMaps"
              class="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-lg text-gray-900">{{ clinicInfo.address }}</span>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-md mx-auto px-6 py-6 space-y-8">
        <!-- Opening Hours -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Opening Hours</h3>
          <p class="text-lg text-gray-700">{{ clinicInfo.hours }}</p>
        </div>

        <!-- Veterinarians -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Our Veterinarians</h3>
          <div class="space-y-4">
            <div
              v-for="vet in clinicInfo.veterinarians"
              :key="vet.name"
              class="flex items-center gap-4"
            >
              <img
                :src="vet.image"
                :alt="vet.name"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 class="text-lg font-semibold text-gray-900">{{ vet.name }}</h4>
                <p class="text-gray-600">{{ vet.title }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Our Services</h3>
          <ul class="space-y-2">
            <li
              v-for="service in clinicInfo.services"
              :key="service"
              class="flex items-center gap-2 text-gray-700"
            >
              <span class="w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
              <span class="text-lg">{{ service }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
