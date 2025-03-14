-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT,
  password TEXT,
  current_role TEXT,
  target_role TEXT,
  skills JSONB DEFAULT '[]'::JSONB,
  preferences JSONB DEFAULT NULL,
  has_completed_survey BOOLEAN DEFAULT FALSE,
  survey_step INTEGER DEFAULT 1
);

-- Create resume analysis table
CREATE TABLE IF NOT EXISTS resume_analysis (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  skills JSONB DEFAULT '[]'::JSONB,
  missing_skills JSONB DEFAULT '[]'::JSONB,
  recommendations JSONB DEFAULT '[]'::JSONB,
  suggested_roles JSONB DEFAULT '[]'::JSONB,
  experience JSONB DEFAULT '[]'::JSONB,
  education JSONB DEFAULT '[]'::JSONB
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  platform TEXT DEFAULT 'Unknown',
  difficulty TEXT NOT NULL,
  duration TEXT DEFAULT 'Unknown',
  skills JSONB DEFAULT '[]'::JSONB,
  url TEXT DEFAULT '#',
  price TEXT,
  rating REAL,
  ai_match_score REAL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id ON resume_analysis(user_id);

-- Create a test table for connection testing
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  name TEXT
);

-- Insert a test record
INSERT INTO test (name) VALUES ('Supabase Connection Test') ON CONFLICT DO NOTHING;

-- Default admin user for development
INSERT INTO user_profiles (user_id, username, password, has_completed_survey, survey_step) 
VALUES ('1', 'demo_user', 'demo_password', FALSE, 1) 
ON CONFLICT (user_id) DO NOTHING; 