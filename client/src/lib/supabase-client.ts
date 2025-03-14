import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  if (!supabaseUrl) console.error('VITE_SUPABASE_URL is missing');
  if (!supabaseAnonKey) console.error('VITE_SUPABASE_ANON_KEY is missing');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

/**
 * Test Supabase connection
 * @returns {Promise<boolean>} Whether the connection was successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful!', data);
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
}

/**
 * Get the current status of Supabase connection
 * @returns {Promise<{connected: boolean; error?: string}>}
 */
export async function getSupabaseStatus(): Promise<{connected: boolean; error?: string}> {
  try {
    const isConnected = await testConnection();
    return { 
      connected: isConnected,
      error: isConnected ? undefined : 'Could not connect to Supabase'
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error?.message || 'Unknown connection error'
    };
  }
}

/**
 * Get a user's resume analysis from Supabase
 * @param userId - The user ID to get analysis for
 * @returns Resume analysis data or null if not found
 */
export async function getUserResumeAnalysis(userId: string) {
  try {
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
    
    return {
      skills: data.skills || [],
      missingSkills: data.missing_skills || [],
      recommendations: data.recommendations || [],
      suggestedRoles: data.suggested_roles || [],
      experience: data.experience || [],
      education: data.education || []
    };
  } catch (err) {
    console.error('Error fetching resume analysis:', err);
    return null;
  }
} 