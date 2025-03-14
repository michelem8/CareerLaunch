import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  if (!supabaseUrl) console.error('SUPABASE_URL is missing');
  if (!supabaseKey) console.error('SUPABASE_SERVICE_KEY is missing');
} else {
  console.log('Supabase client initialized with URL:', supabaseUrl);
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false
    }
  }
);

// Test function to verify connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
}

// Types for our database schema
export interface UserProfile {
  id: number;
  created_at?: string;
  user_id: string;
  username?: string;
  password?: string;
  current_role: string | null;
  target_role: string | null;
  skills: string[];
  has_completed_survey: boolean;
  preferences?: any | null;
  survey_step?: number;
}

export interface ResumeAnalysisRecord {
  id: number;
  created_at?: string;
  user_id: string;
  skills: string[];
  missing_skills: string[];
  recommendations: string[];
  suggested_roles: string[];
  experience: string[];
  education: string[];
}

// Helper function to get a user's profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
  
  return data;
}

// Helper function to get a user's resume analysis
export async function getResumeAnalysis(userId: string): Promise<ResumeAnalysisRecord | null> {
  const { data, error } = await supabase
    .from('resume_analysis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching resume analysis:', error.message);
    return null;
  }
  
  return data;
}

// Helper function to update a user's resume analysis
export async function updateResumeAnalysis(
  userId: string, 
  analysis: Omit<ResumeAnalysisRecord, 'id' | 'created_at' | 'user_id'>
): Promise<ResumeAnalysisRecord | null> {
  // First check if the user has an existing analysis
  const existing = await getResumeAnalysis(userId);
  
  if (existing) {
    // Update the existing record
    const { data, error } = await supabase
      .from('resume_analysis')
      .update({
        skills: analysis.skills,
        missing_skills: analysis.missing_skills,
        recommendations: analysis.recommendations,
        suggested_roles: analysis.suggested_roles,
        experience: analysis.experience,
        education: analysis.education
      })
      .eq('id', existing.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating resume analysis:', error.message);
      return null;
    }
    
    return data;
  } else {
    // Create a new record
    const { data, error } = await supabase
      .from('resume_analysis')
      .insert([{
        user_id: userId,
        skills: analysis.skills,
        missing_skills: analysis.missing_skills,
        recommendations: analysis.recommendations,
        suggested_roles: analysis.suggested_roles,
        experience: analysis.experience,
        education: analysis.education
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating resume analysis:', error.message);
      return null;
    }
    
    return data;
  }
} 