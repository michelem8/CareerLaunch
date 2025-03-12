import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { getSkillGapAnalysis } from '../../server/openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== API HANDLER START: /api/survey/complete ====');
  console.log('Request method:', req.method);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Environment variables:', {
    OPENAI_API_KEY_EXISTS: Boolean(process.env.OPENAI_API_KEY),
    OPENAI_API_KEY_PREFIX: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) + '...' : 'Not set'
  });
  
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    res.status(200).end();
    return;
  }

  // Handle the POST request for completing the survey
  if (req.method === 'POST') {
    console.log('Processing POST request to complete survey');
    try {
      // Get the current user
      const userId = 1; // In a real app, get from session
      console.log('Fetching user data for ID:', userId);
      
      let user;
      try {
        user = await storage.getUser(userId);
        console.log('User data retrieved:', user ? 'Success' : 'Not found');
      } catch (userError) {
        console.error('Error fetching user:', userError);
        throw new Error(`Failed to fetch user: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }
      
      if (!user) {
        console.log('Creating default user since none was found');
        // Create a default user if none exists
        try {
          user = await storage.createUser({
            username: "demo_user",
            password: "demo_password"
          });
          console.log('Default user created:', user);
        } catch (createError) {
          console.error('Error creating default user:', createError);
          throw new Error(`Failed to create default user: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
        }
      }

      // If we have both roles and skills, perform skill gap analysis
      if (user.targetRole && user.skills?.length) {
        console.log('User has target role and skills, performing skill gap analysis');
        console.log('Target role:', user.targetRole);
        console.log('Current skills:', user.skills);
        
        let skillGap;
        try {
          skillGap = await getSkillGapAnalysis(
            user.skills,
            user.targetRole,
            { currentRole: user.currentRole || undefined }
          );
          console.log('Skill gap analysis successful');
          
          // Update the analysis with new skill gap data
          const mergedAnalysis = {
            skills: user.resumeAnalysis?.skills || [],
            experience: user.resumeAnalysis?.experience || [],
            education: user.resumeAnalysis?.education || [],
            suggestedRoles: user.resumeAnalysis?.suggestedRoles || [],
            missingSkills: skillGap.missingSkills,
            recommendations: skillGap.recommendations
          };
          
          console.log('Updating user resume analysis with new data');
          user = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
          console.log('User resume analysis updated successfully');
        } catch (skillGapError) {
          // Log error but continue with process - don't fail the entire request
          console.error('Error in skill gap analysis, but continuing:', skillGapError);
          
          // Create fallback analysis data if the OpenAI service fails
          const fallbackMissingSkills = [
            "Technical Leadership", 
            "Team Management",
            "Strategic Planning",
            "Stakeholder Communication"
          ];
          
          const fallbackRecommendations = [
            "Take a leadership course focused on technical teams",
            "Practice delegating technical tasks while maintaining oversight",
            "Develop stronger architecture and system design knowledge"
          ];
          
          // Update with fallback data
          const fallbackAnalysis = {
            skills: user.resumeAnalysis?.skills || [],
            experience: user.resumeAnalysis?.experience || [],
            education: user.resumeAnalysis?.education || [],
            suggestedRoles: user.resumeAnalysis?.suggestedRoles || ["Engineering Manager", "Technical Lead", "Director of Engineering"],
            missingSkills: user.resumeAnalysis?.missingSkills || fallbackMissingSkills,
            recommendations: user.resumeAnalysis?.recommendations || fallbackRecommendations
          };
          
          console.log('Using fallback analysis data');
          try {
            user = await storage.updateUserResumeAnalysis(userId, fallbackAnalysis);
            console.log('User resume analysis updated with fallback data');
          } catch (updateError) {
            console.error('Error updating user with fallback data:', updateError);
            throw new Error(`Failed to update user with fallback data: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
          }
        }
      } else {
        console.log('User missing target role or skills for analysis');
        console.log('Target role:', user.targetRole);
        console.log('Skills:', user.skills);
      }

      // Complete the survey
      console.log('Completing user survey');
      try {
        user = await storage.completeUserSurvey(userId);
        console.log('Survey completion successful. Final user state:', JSON.stringify(user, null, 2));
      } catch (completeError) {
        console.error('Error completing user survey:', completeError);
        throw new Error(`Failed to complete user survey: ${completeError instanceof Error ? completeError.message : 'Unknown error'}`);
      }
      
      res.status(200).json(user);
      console.log('==== API HANDLER END: /api/survey/complete ====');
    } catch (error) {
      console.error('Error completing survey:', error);
      
      // Create a more detailed error response
      const errorDetails = {
        error: {
          code: "500",
          message: error instanceof Error ? error.message : 'A server error has occurred',
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
          timestamp: new Date().toISOString(),
        }
      };
      
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      res.status(500).json(errorDetails);
      console.log('==== API HANDLER ERROR END: /api/survey/complete ====');
    }
  } else {
    // Method not allowed
    console.log(`Method ${req.method} not allowed`);
    res.status(405).json({ error: 'Method not allowed' });
    console.log('==== API HANDLER END: /api/survey/complete (Method not allowed) ====');
  }
} 