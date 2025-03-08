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

  // Mock user data for test
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

  // Return mock user data
  res.status(200).json(mockUser);
} 