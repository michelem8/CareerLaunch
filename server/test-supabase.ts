import { supabase, testSupabaseConnection, getUserProfile, getResumeAnalysis, updateResumeAnalysis } from './supabase-client';

// Test the Supabase connection
async function testSupabaseIntegration() {
  console.log('🚀 Testing Supabase integration...');
  
  try {
    // Test the connection
    const connectionSuccess = await testSupabaseConnection();
    if (!connectionSuccess) {
      console.error('❌ Supabase connection test failed.');
      return;
    }
    
    // Test user operations
    const testUserId = '1'; // Using the default user ID we created in the migration
    console.log(`👤 Looking up test user (ID: ${testUserId})...`);
    
    // Get user profile
    const userProfile = await getUserProfile(testUserId);
    if (!userProfile) {
      console.error(`❌ Test user (ID: ${testUserId}) not found. Make sure you've run migrations.`);
      return;
    }
    
    console.log('✅ Test user found:', userProfile);
    
    // Get user's resume analysis
    const existingAnalysis = await getResumeAnalysis(testUserId);
    console.log('📄 Existing resume analysis:', existingAnalysis || 'None');
    
    // Create or update resume analysis
    console.log('📝 Creating test resume analysis...');
    const newAnalysis = {
      skills: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
      missing_skills: ['GraphQL', 'AWS', 'Docker'],
      recommendations: [
        'Learn GraphQL for API integration',
        'Get certified in AWS',
        'Build projects with Docker'
      ],
      suggested_roles: ['Frontend Developer', 'Full Stack Developer'],
      experience: ['Company XYZ - Frontend Developer (2019-2023)'],
      education: ['Bachelor of Science, Computer Science']
    };
    
    const updatedAnalysis = await updateResumeAnalysis(testUserId, newAnalysis);
    
    if (updatedAnalysis) {
      console.log('✅ Resume analysis created/updated successfully:', updatedAnalysis);
    } else {
      console.error('❌ Failed to create/update resume analysis');
    }
    
    // Fetch analysis again to confirm
    const finalAnalysis = await getResumeAnalysis(testUserId);
    console.log('📄 Final resume analysis:', finalAnalysis);
    
    console.log('✅ Supabase integration tests completed successfully!');
  } catch (error) {
    console.error('❌ Error testing Supabase integration:', error);
  } finally {
    // Close the Supabase connection
    await supabase.auth.signOut();
  }
}

// Run the test
testSupabaseIntegration().catch(console.error); 