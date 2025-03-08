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
    skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
    surveyCompleted: true,
    hasCompletedSurvey: true,
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
      ],
      suggestedRoles: ["Technical Product Manager", "Engineering Manager", "Development Team Lead"]
    },
    preferences: {
      preferredIndustries: ["enterprise-software", "ai-ml"],
      learningStyles: ["practical", "self-paced"],
      timeCommitment: "4-8"
    }
  };

  // Return mock user data
  res.status(200).json(mockUser);
} 