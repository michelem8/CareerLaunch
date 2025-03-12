import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  // Main handler for AI endpoints
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({ 
        status: 'error',
        message: 'OpenAI API key is not configured'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'AI API is ready',
      endpoints: [
        { 
          path: '/api/ai/recommendations', 
          description: 'Generate career recommendations based on skill gaps',
          method: 'POST',
          body: { skills: ['Array of skill names'] }
        },
        { 
          path: '/api/courses/recommended', 
          description: 'Get course recommendations based on missing skills',
          method: 'GET',
          query: 'skills=skill1&skills=skill2'
        }
      ]
    });
  } catch (error) {
    console.error('Error in AI handler:', error);
    
    // Return error status
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 