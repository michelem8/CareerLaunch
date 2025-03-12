import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { getSkillGapAnalysis } from '../../server/openai';
import { rolesSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    try {
      // Log request for debugging
      console.log('Request body:', req.body);
      
      // Validate the roles data
      const { currentRole, targetRole } = rolesSchema.parse(req.body);
      
      // Get or create user
      const userId = 1; // In a real app, get from session
      let user;
      
      try {
        user = await storage.getUser(userId);
        if (!user) {
          user = await storage.createUser({
            username: "demo_user",
            password: "demo_password"
          });
        }
      } catch (storageError) {
        console.error('Error getting/creating user:', storageError);
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
        user = await storage.updateUserRoles(userId, currentRole, targetRole);
      } catch (updateError) {
        console.error('Error updating user roles:', updateError);
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
          const skillGap = await getSkillGapAnalysis(
            user.skills,
            targetRole,
            { currentRole }
          );

          // Update the analysis with new skill gap data
          const mergedAnalysis = {
            skills: user.resumeAnalysis?.skills || [],
            experience: user.resumeAnalysis?.experience || [],
            education: user.resumeAnalysis?.education || [],
            suggestedRoles: user.resumeAnalysis?.suggestedRoles || [],
            missingSkills: skillGap.missingSkills,
            recommendations: skillGap.recommendations
          };

          user = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
        } catch (analysisError) {
          // If skill gap analysis fails, log it but don't fail the whole request
          console.error('Error in skill gap analysis:', analysisError);
          // We can still return the user with updated roles even if this part fails
        }
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error saving roles:', error);
      
      // Improved error handling with proper status codes
      if (error.name === 'ZodError') {
        // Validation error
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
} 