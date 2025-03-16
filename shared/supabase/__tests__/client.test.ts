import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase, generateLocalStorageId, getUserPreferences, saveUserPreferences } from '../client'
import { SupabaseClient } from '@supabase/supabase-js'
import type { DatabaseSchema } from '../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock crypto.randomUUID
const mockUUID = '12345678-1234-1234-1234-123456789012'
const cryptoMock = {
  randomUUID: () => mockUUID
}

describe('Supabase Client', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    Object.defineProperty(window, 'crypto', { value: cryptoMock })
    localStorageMock.clear()
    vi.restoreAllMocks()
  })

  describe('generateLocalStorageId', () => {
    it('should generate and store a new ID if none exists', () => {
      const id = generateLocalStorageId()
      expect(id).toBe(mockUUID)
      expect(localStorageMock.getItem('career_launch_user_id')).toBe(mockUUID)
    })

    it('should return existing ID if one exists', () => {
      const existingId = 'existing-id'
      localStorageMock.setItem('career_launch_user_id', existingId)
      const id = generateLocalStorageId()
      expect(id).toBe(existingId)
    })
  })

  describe('getUserPreferences', () => {
    it('should return null if preferences not found', async () => {
      vi.spyOn(supabase as unknown as SupabaseClient<DatabaseSchema>, 'from').mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      } as any)

      const preferences = await getUserPreferences()
      expect(preferences).toBeNull()
    })

    it('should return preferences if found', async () => {
      const mockPreferences = {
        local_storage_id: mockUUID,
        preferred_job_titles: ['Software Engineer'],
        preferred_skills: [],
        salary_expectation_min: 80000,
        salary_expectation_max: 120000,
        preferred_job_level: 'mid',
        location_preference: 'Remote',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      vi.spyOn(supabase as unknown as SupabaseClient<DatabaseSchema>, 'from').mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: mockPreferences,
              error: null
            })
          })
        })
      } as any)

      const preferences = await getUserPreferences()
      expect(preferences).toEqual(mockPreferences)
    })
  })

  describe('saveUserPreferences', () => {
    it('should save and return preferences', async () => {
      const newPreferences = {
        preferred_job_titles: ['Software Engineer'],
        preferred_skills: [],
        salary_expectation_min: 80000,
        salary_expectation_max: 120000,
        preferred_job_level: 'mid' as const,
        location_preference: 'Remote'
      }

      const mockResponse = {
        ...newPreferences,
        local_storage_id: mockUUID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      vi.spyOn(supabase as unknown as SupabaseClient<DatabaseSchema>, 'from').mockReturnValue({
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: mockResponse,
              error: null
            })
          })
        })
      } as any)

      const savedPreferences = await saveUserPreferences(newPreferences)
      expect(savedPreferences).toEqual(mockResponse)
    })

    it('should return null on error', async () => {
      const newPreferences = {
        preferred_job_titles: ['Software Engineer'],
        preferred_skills: [],
        salary_expectation_min: 80000,
        salary_expectation_max: 120000,
        preferred_job_level: 'mid' as const,
        location_preference: 'Remote'
      }

      vi.spyOn(supabase as unknown as SupabaseClient<DatabaseSchema>, 'from').mockReturnValue({
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      } as any)

      const savedPreferences = await saveUserPreferences(newPreferences)
      expect(savedPreferences).toBeNull()
    })
  })
}) 