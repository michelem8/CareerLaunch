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
      // Validate the roles data
      const { currentRole, targetRole } = rolesSchema.parse(req.body);
      
      // Get or create user
      const userId = 1; // In a real app, get from session
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: "demo_user",
          password: "demo_password"
        });
      }

      // Update the roles
      user = await storage.updateUserRoles(userId, currentRole, targetRole);

      // If we have current skills, perform skill gap analysis
      if (user.skills?.length) {
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
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error saving roles:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to save roles',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 