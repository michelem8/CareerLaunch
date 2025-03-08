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

  // Handle the POST request for completing the survey
  if (req.method === 'POST') {
    try {
      // In a real app, you would update the user's status in the database
      console.log('User completed survey');
      
      // Mock response with updated user
      const mockUser = {
        id: 1,
        username: "demo_user",
        currentRole: "Product Manager",
        targetRole: "Engineering Manager",
        surveyCompleted: true,
        preferences: {
          preferredIndustries: ["enterprise-software", "ai-ml"],
          learningStyles: ["practical", "self-paced"],
          timeCommitment: "4-8"
        }
      };
      
      res.status(200).json(mockUser);
    } catch (error) {
      console.error('Error completing survey:', error);
      res.status(500).json({ error: 'Failed to complete survey' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 