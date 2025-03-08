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

  // Handle the POST request for analyzing resume
  if (req.method === 'POST') {
    try {
      // Get the resume text from the request body
      const { resumeText } = req.body;
      
      // In a real app, you would send this to OpenAI for analysis
      console.log('Resume text length:', resumeText?.length || 0);
      
      // Mock response with sample analysis
      const mockAnalysis = {
        user: {
          id: 1,
          username: "demo_user",
          resumeAnalysis: {
            skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
            experience: [
              "Senior Product Manager at Tech Company (2018-2023)",
              "Product Manager at Software Inc (2015-2018)"
            ],
            education: [
              "MBA, Business School (2015)",
              "BS Computer Science, University (2012)"
            ],
            missingSkills: [
              "Engineering Leadership",
              "Team Building", 
              "Technical Architecture",
              "Cross-functional Communication"
            ],
            recommendations: [
              "Focus on team building and leadership skills",
              "Develop deeper technical architecture knowledge",
              "Practice making technical decisions at scale"
            ]
          }
        },
        skillGap: {
          missingSkills: [
            "Engineering Leadership",
            "Team Building", 
            "Technical Architecture",
            "Cross-functional Communication"
          ],
          recommendations: [
            "Focus on team building and leadership skills",
            "Develop deeper technical architecture knowledge",
            "Practice making technical decisions at scale"
          ]
        }
      };
      
      res.status(200).json(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({ error: 'Failed to analyze resume' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 