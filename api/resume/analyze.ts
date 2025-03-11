import { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeResume, getSkillGapAnalysis } from '../../server/openai';
import { storage } from '../../server/storage';

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

  // Handle the POST request for analyzing resume
  if (req.method === 'POST') {
    try {
      // Get the resume text from the request body
      const { resumeText } = req.body;
      if (!resumeText) {
        throw new Error('Resume text is required');
      }

      // Get the current user
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Analyze the resume using OpenAI
      const analysis = await analyzeResume(resumeText);
      
      // Get skill gap analysis based on current role and target role
      const skillGap = await getSkillGapAnalysis(
        analysis.skills || [],
        user.targetRole || '',
        { currentRole: user.currentRole || undefined }
      );

      // Merge the analyses
      const mergedAnalysis = {
        ...analysis,
        missingSkills: skillGap.missingSkills,
        recommendations: skillGap.recommendations
      };

      // Update user with the analysis results
      const updatedUser = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
      
      res.status(200).json({
        user: updatedUser,
        skillGap
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to analyze resume',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 