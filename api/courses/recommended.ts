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

  // Handle the GET request for recommended courses
  if (req.method === 'GET') {
    try {
      // Get skills from query parameters 
      const skills = req.query.skills || [];
      console.log('Requested skills:', skills);
      
      // Mock response with recommended courses
      const recommendedCourses = [
        {
          id: 1,
          title: "Engineering Leadership Fundamentals",
          description: "Learn the core principles of leading engineering teams effectively",
          imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
          skills: ["Engineering Leadership", "Team Management", "Technical Decision Making"],
          difficulty: "intermediate",
          industry: "enterprise-software",
          learningStyle: "practical",
          timeCommitment: "4-8",
          level: "intermediate"
        },
        {
          id: 2,
          title: "Technical Architecture for Managers",
          description: "Bridge the gap between management and technical architecture",
          imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
          skills: ["Technical Architecture", "System Design", "Architecture Planning"],
          difficulty: "advanced",
          industry: "enterprise-software",
          learningStyle: "project_based",
          timeCommitment: "4-8",
          level: "advanced"
        },
        {
          id: 3,
          title: "Cross-functional Communication",
          description: "Effectively communicate across engineering and product teams",
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
          skills: ["Cross-functional Communication", "Leadership", "Team Collaboration"],
          difficulty: "intermediate",
          industry: "product-management",
          learningStyle: "interactive",
          timeCommitment: "2-4",
          level: "intermediate"
        }
      ];
      
      res.status(200).json(recommendedCourses);
    } catch (error) {
      console.error('Error getting recommended courses:', error);
      res.status(500).json({ error: 'Failed to get recommended courses' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 