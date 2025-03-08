import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://careerpathfinder.io');
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
      // Get the roles from the request body
      const { currentRole, targetRole } = req.body;
      
      // In a real app, you would save these to a database
      console.log('Saving roles:', { currentRole, targetRole });
      
      // Mock response with the updated roles
      const mockResponse = {
        id: 1,
        username: "demo_user",
        currentRole: currentRole || "Product Manager",
        targetRole: targetRole || "Engineering Manager",
        surveyCompleted: false
      };
      
      res.status(200).json(mockResponse);
    } catch (error) {
      console.error('Error saving roles:', error);
      res.status(500).json({ error: 'Failed to save roles' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 