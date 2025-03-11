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

  // Handle the POST request for saving survey data
  if (req.method === 'POST') {
    try {
      // Get survey data from request
      const surveyData = req.body;
      console.log('Received survey data:', surveyData);
      
      // Generate dynamic recommendations based on the target role
      const missingSkills = generateMissingSkills(surveyData.targetRole);
      const recommendations = generateRecommendations(surveyData.targetRole, surveyData.currentRole);
      const suggestedRoles = generateSuggestedRoles(surveyData.currentRole, surveyData.targetRole);
      
      // Mock response with updated user - now with dynamic data
      const mockUser = {
        id: 1,
        username: "demo_user",
        currentRole: surveyData.currentRole || "Product Manager",
        targetRole: surveyData.targetRole || "Engineering Manager",
        surveyCompleted: true,
        hasCompletedSurvey: true,
        skills: generateCurrentSkills(surveyData.currentRole),
        resumeAnalysis: {
          skills: generateCurrentSkills(surveyData.currentRole),
          experience: generateExperience(surveyData.currentRole),
          education: ["BS Computer Science, University", "MBA, Business School"],
          missingSkills: missingSkills,
          recommendations: recommendations,
          suggestedRoles: suggestedRoles
        },
        preferences: surveyData.preferences || {
          preferredIndustries: ["enterprise-software", "ai-ml"],
          learningStyles: ["practical", "self-paced"],
          timeCommitment: "4-8"
        }
      };
      
      res.status(200).json(mockUser);
    } catch (error) {
      console.error('Error saving survey data:', error);
      res.status(500).json({ error: 'Failed to save survey data' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper functions to generate dynamic data
function generateMissingSkills(targetRole: string): string[] {
  const roleSkillMap: Record<string, string[]> = {
    "Software Engineer": ["Data Structures", "Algorithms", "System Design", "JavaScript", "Python"],
    "Frontend Developer": ["React", "CSS", "UI/UX", "Responsive Design", "JavaScript Frameworks"],
    "Backend Developer": ["Node.js", "Databases", "API Design", "Server Architecture", "Cloud Services"],
    "Data Scientist": ["Machine Learning", "Python", "Statistical Analysis", "Data Visualization", "Big Data"],
    "Product Manager": ["Product Strategy", "User Research", "Roadmap Planning", "Stakeholder Management", "Market Analysis"],
    "Engineering Manager": ["Engineering Leadership", "Team Building", "Technical Architecture", "Cross-functional Communication", "Project Management"],
    "UX Designer": ["User Research", "Wireframing", "Prototyping", "Information Architecture", "Usability Testing"],
    "DevOps Engineer": ["CI/CD", "Infrastructure as Code", "Container Technologies", "Cloud Platforms", "Monitoring & Logging"]
  };
  
  // Return skills for the given role, or default if not found
  return roleSkillMap[targetRole] || ["Leadership", "Communication", "Technical Skills", "Problem Solving", "Project Management"];
}

function generateRecommendations(targetRole: string, currentRole: string): string[] {
  const recommendations: Record<string, string[]> = {
    "Software Engineer": [
      "Build a portfolio of programming projects",
      "Complete a full-stack web development bootcamp",
      "Practice data structures and algorithms",
      "Contribute to open-source projects",
      "Learn system design principles"
    ],
    "Engineering Manager": [
      "Focus on team building and leadership skills",
      "Develop deeper technical architecture knowledge",
      "Practice making technical decisions at scale",
      "Learn about team dynamics and management",
      "Build cross-functional communication skills"
    ]
  };
  
  // If we have specific recommendations for the target role, use those
  if (recommendations[targetRole]) {
    return recommendations[targetRole];
  }
  
  // Otherwise return generic recommendations based on career transition
  return [
    `Learn the fundamentals of ${targetRole} through online courses`,
    `Build practical projects that demonstrate ${targetRole} skills`,
    `Network with professionals in the ${targetRole} field`,
    `Identify transferable skills from ${currentRole || 'your current role'} to ${targetRole}`,
    `Consider certification programs in ${targetRole}`
  ];
}

function generateSuggestedRoles(currentRole: string, targetRole: string): string[] {
  // Define related roles based on the target role
  const relatedRoles: Record<string, string[]> = {
    "Software Engineer": ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"],
    "Frontend Developer": ["UI Developer", "React Developer", "JavaScript Engineer", "UX Engineer"],
    "Backend Developer": ["API Developer", "Database Engineer", "Systems Developer", "Cloud Engineer"],
    "Data Scientist": ["Data Analyst", "Machine Learning Engineer", "AI Researcher", "BI Developer"],
    "Product Manager": ["Product Owner", "Technical Product Manager", "Product Analyst", "Project Manager"],
    "Engineering Manager": ["Technical Team Lead", "Development Manager", "CTO", "Technical Program Manager"],
    "UX Designer": ["UI Designer", "Product Designer", "UX Researcher", "Interaction Designer"],
    "DevOps Engineer": ["Site Reliability Engineer", "Infrastructure Engineer", "Platform Engineer", "Release Engineer"]
  };
  
  return relatedRoles[targetRole] || ["Similar Role 1", "Similar Role 2", "Similar Role 3"];
}

function generateCurrentSkills(currentRole: string): string[] {
  const roleSkillMap: Record<string, string[]> = {
    "Software Engineer": ["JavaScript", "HTML", "CSS", "Git", "Problem Solving"],
    "Frontend Developer": ["React", "HTML", "CSS", "UI/UX", "JavaScript"],
    "Backend Developer": ["Python", "Node.js", "Databases", "API Design", "Server Management"],
    "Data Scientist": ["Python", "R", "Statistics", "Data Analysis", "SQL"],
    "Product Manager": ["Product Strategy", "User Research", "Roadmap Planning", "Stakeholder Management", "Agile"],
    "Engineering Manager": ["Team Leadership", "Project Management", "Technical Oversight", "Communication", "Agile"],
    "UX Designer": ["User Research", "Wireframing", "Prototyping", "UI Design", "Usability Testing"],
    "DevOps Engineer": ["CI/CD", "Docker", "Kubernetes", "Cloud Platforms", "Automation"]
  };
  
  return roleSkillMap[currentRole] || ["Communication", "Problem Solving", "Analytical Thinking", "Project Management", "Teamwork"];
}

function generateExperience(currentRole: string): string[] {
  return [
    `Senior ${currentRole} at Tech Company (2018-2023)`,
    `${currentRole} at Software Inc (2015-2018)`
  ];
} 