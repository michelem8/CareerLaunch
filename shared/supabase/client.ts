import { createClient } from '@supabase/supabase-js'
import type { DatabaseSchema } from './types'

// Handle both browser and Node.js environments
const getEnvVariable = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    return (window as any).__env?.[key]
  }
  return process.env[key]
}

const supabaseUrl = getEnvVariable('SUPABASE_URL') || getEnvVariable('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVariable('SUPABASE_ANON_KEY') || getEnvVariable('VITE_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anonymous Key')
}

export const supabase = createClient<DatabaseSchema>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Since we're not using auth, we don't need to persist the session
  }
})

// Helper function to generate a unique local storage ID
export const generateLocalStorageId = () => {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available in this environment')
  }

  const existingId = localStorage.getItem('career_launch_user_id')
  if (existingId) {
    return existingId
  }
  
  const newId = crypto.randomUUID()
  localStorage.setItem('career_launch_user_id', newId)
  return newId
}

// Helper function to get user preferences
export const getUserPreferences = async () => {
  const localId = generateLocalStorageId()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('local_storage_id', localId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error fetching user preferences:', error)
    return null
  }

  return data
}

// Helper function to save user preferences
export const saveUserPreferences = async (preferences: Omit<DatabaseSchema['public']['Tables']['user_preferences']['Insert'], 'local_storage_id'>) => {
  const localId = generateLocalStorageId()
  
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      local_storage_id: localId,
      ...preferences
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving user preferences:', error)
    return null
  }

  return data
} 