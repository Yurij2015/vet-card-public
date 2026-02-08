// Local storage service for saving user profile data

export interface UserProfile {
  owner_name: string
  phone: string
  email: string
  updated_at: string
}

const STORAGE_KEY = 'vetcard_user_profile'

// Get saved user profile
export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading user profile from localStorage:', error)
    return null
  }
}

// Save user profile
export function saveUserProfile(profile: Omit<UserProfile, 'updated_at'>): void {
  const data: UserProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving user profile to localStorage:', error)
  }
}

// Clear user profile
export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing user profile from localStorage:', error)
  }
}

