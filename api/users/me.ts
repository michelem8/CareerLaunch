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
  console.log('Environment:', process.env.NODE_ENV);
  
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

  if (req.method === 'GET') {
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
        
        // In production, keep error behavior to avoid showing mock data
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Unable to retrieve user data. Please try again later.');
        }
        
        // Create a default response instead of failing (development only)
        user = {
          id: 1,
          username: "demo_user",
          password: "demo_password",
          currentRole: "Software Developer",
          targetRole: "Engineering Manager",
          skills: ["JavaScript", "React", "Node.js"],
          hasCompletedSurvey: true,
          surveyStep: 3,
          resumeAnalysis: getResumeAnalysis()
        };
        console.log('Created fallback user response due to storage error (development only)');
      }
      
      if (!user) {
        console.log('No user found, creating default user');
        // Create a new user if none exists
        try {
          const newUser = await storage.createUser({
            username: "demo_user",
            password: "demo_password"
          });
          console.log('Default user created successfully');
          res.json(newUser);
          return;
        } catch (createError) {
          console.error('Error creating default user:', createError);
          
          // In production, keep error behavior to avoid showing mock data
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Unable to create user. Please try again later.');
          }
          
          // Return a default user if we can't create one (development only)
          const defaultUser = {
            id: 1,
            username: "demo_user",
            password: "demo_password",
            currentRole: "Software Developer",
            targetRole: "Engineering Manager", 
            skills: ["JavaScript", "React", "Node.js"],
            hasCompletedSurvey: true,
            surveyStep: 3,
            resumeAnalysis: getResumeAnalysis()
          };
          console.log('Returning fallback user after create error (development only)');
          res.json(defaultUser);
          return;
        }
      }
      
      // In production, don't modify the user data - preserve the real state
      if (process.env.NODE_ENV !== 'production') {
        // Only in development: Ensure the user has resumeAnalysis data
        if (!user.resumeAnalysis || !user.resumeAnalysis.missingSkills || !user.resumeAnalysis.recommendations) {
          console.log('User missing resume analysis data, adding fallback data (development only)');
          user.resumeAnalysis = getResumeAnalysis();
          
          // Try to update the user in storage, but don't fail if it doesn't work
          try {
            if (user.hasCompletedSurvey !== true) {
              await storage.completeUserSurvey(userId);
            }
            
            if (!user.resumeAnalysis) {
              await storage.updateUserResumeAnalysis(userId, getResumeAnalysis());
            }
            console.log('Updated user in storage with fallback data (development only)');
          } catch (updateError) {
            console.error('Error updating user in storage:', updateError);
          }
        }
      }
      
      // Add additional logging to see what we're returning
      console.log('Returning user data with resume analysis:', {
        hasResumeAnalysis: !!user.resumeAnalysis,
        missingSkillsCount: user.resumeAnalysis?.missingSkills?.length || 0,
        recommendationsCount: user.resumeAnalysis?.recommendations?.length || 0,
        environment: process.env.NODE_ENV
      });
      
      res.json(user);
      console.log('==== API HANDLER END: /api/users/me ====');
    } catch (error) {
      console.error('Error handling /api/users/me request:', error);
      
      // Return a useful error response
      const errorDetails = {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch user data',
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
          timestamp: new Date().toISOString()
        }
      };
      
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      res.status(500).json(errorDetails);
      console.log('==== API HANDLER ERROR END: /api/users/me ====');
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    console.log('==== API HANDLER END: /api/users/me (Method not allowed) ====');
  }
} 