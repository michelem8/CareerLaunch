const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL or service key not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

console.log(`Supabase client initialized with URL: ${supabaseUrl}`);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  try {
    // Test user_profiles table
    const userProfilesResult = await supabase.from('user_profiles').select('*').limit(5);
    if (userProfilesResult.error) {
      console.error('❌ Error accessing user_profiles table:', userProfilesResult.error.message);
    } else {
      console.log('✅ Successfully connected to user_profiles table');
      console.log(`Found ${userProfilesResult.data.length} records`);
    }
    
    // Test resume_analysis table
    const resumeAnalysisResult = await supabase.from('resume_analysis').select('*').limit(5);
    if (resumeAnalysisResult.error) {
      console.error('❌ Error accessing resume_analysis table:', resumeAnalysisResult.error.message);
    } else {
      console.log('✅ Successfully connected to resume_analysis table');
      console.log(`Found ${resumeAnalysisResult.data.length} records`);
    }
    
    // Test courses table
    const coursesResult = await supabase.from('courses').select('*').limit(5);
    if (coursesResult.error) {
      console.error('❌ Error accessing courses table:', coursesResult.error.message);
    } else {
      console.log('✅ Successfully connected to courses table');
      console.log(`Found ${coursesResult.data.length} records`);
    }
    
    // Test test table
    const testResult = await supabase.from('test').select('*').limit(5);
    if (testResult.error) {
      console.error('❌ Error accessing test table:', testResult.error.message);
    } else {
      console.log('✅ Successfully connected to test table');
      console.log(`Found ${testResult.data.length} records`);
      console.log('Test data:', testResult.data);
    }
  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

// Run test
testConnection(); 