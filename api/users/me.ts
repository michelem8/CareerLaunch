import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { ResumeAnalysis } from '../../shared/schema';

// Fallback data only for development environment
const getResumeAnalysis = (): ResumeAnalysis => {
  // Only use fallback data in development
  if (process.env.NODE_ENV === 'development') {
    return {
      skills: ["JavaScript", "React", "Node.js"],
      experience: ["3 years of frontend development", "1 year of backend development"],
      education: ["BS in Computer Science"],
      suggestedRoles: ["Engineering Manager", "Technical Lead", "Product Manager"],
      missingSkills: [
        "Technical Leadership", 
        "Team Management",
        "Strategic Planning",
        "Stakeholder Communication"
      ],
      recommendations: [
        "Take a leadership course focused on technical teams",
        "Practice delegating technical tasks while maintaining oversight",
        "Develop stronger architecture and system design knowledge",
        "Work on communication skills for technical and non-technical audiences"
      ]
    };
  }
  
  // In production, return empty arrays instead of null
  return {
    skills: [],
    experience: [],
    education: [],
    suggestedRoles: [],
    missingSkills: [],
    recommendations: []
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== API HANDLER START: /api/users/me ====');
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  // Set CORS headers
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

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: '405',
        message: 'Method not allowed'
      }
    });
  }

  try {
    // In a real app, get the user ID from the session
    const userId = 1;
    
    console.log('Fetching user data for ID:', userId);
    
    // Get the actual user data from storage
    let user;
    try {
      user = await storage.getUser(userId);
      console.log('User data retrieved:', user ? 'Success' : 'Not found');
    } catch (error) {
      console.error('Error fetching user from storage:', error);
      return res.status(503).json({
        error: {
          code: '503',
          message: 'Unable to retrieve user data. Please try again later.'
        }
      });
    }
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: '404',
          message: 'User not found'
        }
      });
    }

    // Ensure resumeAnalysis exists with at least empty arrays in the response
    if (!user.resumeAnalysis) {
      console.log('No resumeAnalysis found, creating empty structure for response');
      user.resumeAnalysis = {
        skills: [],
        experience: [],
        education: [],
        suggestedRoles: [],
        missingSkills: [],
        recommendations: []
      };
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to get user data:', error);
    res.status(500).json({ 
      error: {
        code: '500',
        message: 'An unexpected error occurred while retrieving user data',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      }
    });
  }
  
  console.log('==== API HANDLER END: /api/users/me ====');
} 