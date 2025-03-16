import { Database } from '@supabase/supabase-js'

export type JobLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'executive'
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  id: string
  name: string
  category: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  level: JobLevel
  description: string | null
  salary_range_min: number | null
  salary_range_max: number | null
  requirements: string[]
  created_at: string
  updated_at: string
}

export interface CareerPath {
  id: string
  name: string
  description: string | null
  estimated_timeline: string | null
  created_at: string
  updated_at: string
}

export interface CareerPathStep {
  id: string
  career_path_id: string
  step_number: number
  title: string
  description: string | null
  duration: string | null
  created_at: string
  updated_at: string
}

export interface JobSkill {
  job_id: string
  skill_id: string
  required_proficiency: SkillProficiency
}

export interface CareerPathJob {
  career_path_id: string
  job_id: string
  sequence_order: number
}

export interface UserPreferences {
  local_storage_id: string
  preferred_job_titles: string[]
  preferred_skills: string[]
  salary_expectation_min: number | null
  salary_expectation_max: number | null
  preferred_job_level: JobLevel | null
  location_preference: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseSchema {
  public: {
    Tables: {
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Skill, 'id' | 'created_at' | 'updated_at'>>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>
      }
      career_paths: {
        Row: CareerPath
        Insert: Omit<CareerPath, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CareerPath, 'id' | 'created_at' | 'updated_at'>>
      }
      career_path_steps: {
        Row: CareerPathStep
        Insert: Omit<CareerPathStep, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CareerPathStep, 'id' | 'created_at' | 'updated_at'>>
      }
      job_skills: {
        Row: JobSkill
        Insert: JobSkill
        Update: Partial<JobSkill>
      }
      career_path_jobs: {
        Row: CareerPathJob
        Insert: CareerPathJob
        Update: Partial<CareerPathJob>
      }
      user_preferences: {
        Row: UserPreferences
        Insert: Omit<UserPreferences, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserPreferences, 'created_at' | 'updated_at'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      job_level: JobLevel
      skill_proficiency: SkillProficiency
    }
  }
} 