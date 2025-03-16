-- Create enum for job levels
CREATE TYPE job_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'manager', 'executive');

-- Create enum for skill proficiency
CREATE TYPE skill_proficiency AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create skills table
CREATE TABLE skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    level job_level NOT NULL,
    description TEXT,
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    requirements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career_paths table
CREATE TABLE career_paths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_timeline VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career_path_steps table
CREATE TABLE career_path_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    career_path_id UUID REFERENCES career_paths(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_skills table (many-to-many relationship between jobs and skills)
CREATE TABLE job_skills (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    required_proficiency skill_proficiency NOT NULL,
    PRIMARY KEY (job_id, skill_id)
);

-- Create career_path_jobs table (many-to-many relationship between career paths and jobs)
CREATE TABLE career_path_jobs (
    career_path_id UUID REFERENCES career_paths(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    PRIMARY KEY (career_path_id, job_id)
);

-- Create user_preferences table (for local storage-based users)
CREATE TABLE user_preferences (
    local_storage_id VARCHAR(100) PRIMARY KEY,
    preferred_job_titles TEXT[],
    preferred_skills UUID[] REFERENCES skills(id),
    salary_expectation_min INTEGER,
    salary_expectation_max INTEGER,
    preferred_job_level job_level,
    location_preference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_career_paths_name ON career_paths(name);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_career_path_jobs_job_id ON career_path_jobs(job_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update the updated_at column
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_paths_updated_at
    BEFORE UPDATE ON career_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 