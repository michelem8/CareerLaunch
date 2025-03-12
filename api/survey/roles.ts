import { VercelRequest, VercelResponse } from '@vercel/node';
import { rolesSchema } from '../../shared/schema';

// This is a simplified version of the roles API for troubleshooting
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== API HANDLER START: /api/survey/roles (SIMPLIFIED) ====');
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

  // Handle the POST request for saving roles
  if (req.method === 'POST') {
    console.log('Processing POST request');
    
    try {
      // Log request for debugging
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // Validate the roles data
      console.log('Validating roles data');
      const { currentRole, targetRole } = rolesSchema.parse(req.body);
      console.log('Roles validated successfully:', { currentRole, targetRole });
      
      // Create a mock user response without using storage
      const mockUser = {
        id: 1,
        username: "demo_user",
        password: "********", // Masked for security
        currentRole: currentRole,
        targetRole: targetRole,
        skills: [],
        resumeAnalysis: {
          skills: [],
          experience: [],
          education: [],
          suggestedRoles: [],
          missingSkills: [],
          recommendations: []
        },
        preferences: null,
        hasCompletedSurvey: false,
        surveyStep: 2
      };

      console.log('Sending successful mock response');
      res.status(200).json(mockUser);
    } catch (error: unknown) {
      console.error('Error in simplified roles endpoint:', error);
      console.error('Full error details:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Improved error handling with proper status codes
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        // Validation error
        console.error('Validation error details:', JSON.stringify((error as any).errors, null, 2));
        return res.status(400).json({ 
          error: { 
            code: '400', 
            message: 'Invalid input data',
            details: (error as any).errors 
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
  
  console.log('==== API HANDLER END: /api/survey/roles (SIMPLIFIED) ====');
} 