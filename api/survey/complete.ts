import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { getSkillGapAnalysis } from '../../server/openai';

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

  // Handle the POST request for completing the survey
  if (req.method === 'POST') {
    try {
      // Get the current user
      const userId = 1; // In a real app, get from session
      let user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If we have both roles and skills, perform skill gap analysis
      if (user.targetRole && user.skills?.length) {
        const skillGap = await getSkillGapAnalysis(
          user.skills,
          user.targetRole,
          { currentRole: user.currentRole || undefined }
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

      // Complete the survey
      user = await storage.completeUserSurvey(userId);
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error completing survey:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to complete survey',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 