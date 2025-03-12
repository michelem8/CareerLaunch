import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { getSkillGapAnalysis } from '../../server/openai';
import { rolesSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== API HANDLER START: /api/survey/roles ====');
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
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
    res.status(200).end();
    return;
  }

  // Handle the POST request for saving roles
  if (req.method === 'POST') {
    console.log('Processing POST request');
    
    try {
      // Log request for debugging
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // Inspect the storage object
      console.log('Storage object type:', typeof storage);
      console.log('Storage methods:', Object.keys(storage));
      
      // Validate the roles data
      console.log('Validating roles data');
      const { currentRole, targetRole } = rolesSchema.parse(req.body);
      console.log('Roles validated successfully:', { currentRole, targetRole });
      
      // Get or create user
      const userId = 1; // In a real app, get from session
      console.log('Using userId:', userId);
      let user;
      
      try {
        console.log('Attempting to getUser:', userId);
        user = await storage.getUser(userId);
        console.log('getUser result:', user ? 'User found' : 'User not found');
        
        if (!user) {
          console.log('Creating new user');
          user = await storage.createUser({
            username: "demo_user",
            password: "demo_password"
          });
          console.log('New user created:', user.id);
        }
      } catch (storageError) {
        console.error('Error getting/creating user:', storageError);
        console.error('Error details:', storageError instanceof Error ? storageError.stack : 'No stack trace');
        return res.status(500).json({ 
          error: { 
            code: '500', 
            message: 'Failed to get or create user',
            details: storageError instanceof Error ? storageError.message : 'Unknown storage error'
          }
        });
      }

      // Update the roles
      try {
        console.log('Attempting to update user roles:', { userId, currentRole, targetRole });
        user = await storage.updateUserRoles(userId, currentRole, targetRole);
        console.log('User roles updated successfully');
      } catch (updateError) {
        console.error('Error updating user roles:', updateError);
        console.error('Error details:', updateError instanceof Error ? updateError.stack : 'No stack trace');
        return res.status(500).json({ 
          error: { 
            code: '500', 
            message: 'Failed to update user roles',
            details: updateError instanceof Error ? updateError.message : 'Unknown update error'
          }
        });
      }

      // If we have current skills, perform skill gap analysis
      if (user.skills?.length) {
        try {
          console.log('Performing skill gap analysis');
          const skillGap = await getSkillGapAnalysis(
            user.skills,
            targetRole,
            { currentRole }
          );
          console.log('Skill gap analysis completed');

          // Update the analysis with new skill gap data
          const mergedAnalysis = {
            skills: user.resumeAnalysis?.skills || [],
            experience: user.resumeAnalysis?.experience || [],
            education: user.resumeAnalysis?.education || [],
            suggestedRoles: user.resumeAnalysis?.suggestedRoles || [],
            missingSkills: skillGap.missingSkills,
            recommendations: skillGap.recommendations
          };

          console.log('Updating user resume analysis');
          user = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
          console.log('Resume analysis updated successfully');
        } catch (analysisError) {
          // If skill gap analysis fails, log it but don't fail the whole request
          console.error('Error in skill gap analysis:', analysisError);
          console.error('Analysis error details:', analysisError instanceof Error ? analysisError.stack : 'No stack trace');
          // We can still return the user with updated roles even if this part fails
        }
      }

      console.log('Sending successful response');
      res.status(200).json(user);
    } catch (error) {
      console.error('Error saving roles:', error);
      console.error('Full error details:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Improved error handling with proper status codes
      if (error.name === 'ZodError') {
        // Validation error
        console.error('Validation error details:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          error: { 
            code: '400', 
            message: 'Invalid input data',
            details: error.errors 
          }
        });
      } else {
        // Server error - provide a standard error format
        return res.status(500).json({ 
          error: { 
            code: '500', 
            message: 'A server error has occurred',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: { code: '405', message: 'Method not allowed' } });
  }
  
  console.log('==== API HANDLER END: /api/survey/roles ====');
} 