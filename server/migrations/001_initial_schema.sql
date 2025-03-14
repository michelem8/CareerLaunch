-- Create tables for our application

-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL UNIQUE,
  current_role TEXT,
  target_role TEXT,
  skills TEXT[] DEFAULT '{}',
  has_completed_survey BOOLEAN DEFAULT FALSE
);

-- Resume Analysis table
CREATE TABLE IF NOT EXISTS resume_analysis (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  suggested_roles TEXT[] DEFAULT '{}',
  experience TEXT[] DEFAULT '{}',
  education TEXT[] DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id ON resume_analysis(user_id);

-- Create a simple test table for connection testing
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  name TEXT
);

-- Insert a test record
INSERT INTO test (name) VALUES ('Connection successful')
ON CONFLICT DO NOTHING; 