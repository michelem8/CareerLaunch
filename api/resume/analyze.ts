import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { ResumeAnalysis } from '../../shared/schema';

// This is a simplified version of the resume analysis API for troubleshooting
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== API HANDLER START: /api/resume/analyze (SIMPLIFIED) ====');
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

  // Handle the POST request for analyzing resume
  if (req.method === 'POST') {
    try {
      const { resumeText, userId } = req.body;
      console.log('Received resume text for analysis (length):', resumeText?.length || 0);
      console.log('User ID:', userId);

      if (!resumeText) {
        return res.status(400).json({ error: 'Resume text is required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      console.log('Analyzing resume...');
      const result = await analyzeResume(resumeText);
      console.log('Analysis complete');

      // Ensure result includes all expected fields with default values if needed
      const analysis = {
        skills: result.skills || [],
        experience: result.experience || [],
        education: result.education || [],
        suggestedRoles: result.suggestedRoles || [],
        missingSkills: result.missingSkills || [],
        recommendations: result.recommendations || []
      };

      // Save the analysis to storage
      await storage.updateUserResumeAnalysis(userId, analysis);
      console.log('Analysis saved to storage for user', userId);

      return res.status(200).json(analysis);
    } catch (error: any) {
      console.error('Error analyzing resume:', error.message);
      return res.status(500).json({
        error: 'Failed to analyze resume',
        details: error.message
      });
    }
  } else {
    // Method not allowed
    res.status(405).json({ 
      error: { 
        code: '405', 
        message: 'Method not allowed' 
      }
    });
  }
  
  console.log('==== API HANDLER END: /api/resume/analyze (SIMPLIFIED) ====');
}

/**
 * Extract skills from resume text using simple pattern matching
 */
function extractSkillsFromResume(resumeText: string): string[] {
  // This is a simplified implementation
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", 
    "Express", "Next.js", "HTML", "CSS", "SCSS", "SQL", "NoSQL", "MongoDB",
    "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes", "Git", "GitHub",
    "REST API", "GraphQL", "Redux", "Context API", "Jest", "Cypress",
    "Webpack", "Python", "Java", "C#", ".NET", "PHP", "Ruby", "Go",
    "CI/CD", "Agile", "Scrum", "Project Management"
  ];
  
  // Simple check: see which skills are mentioned in the resume text
  return commonSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
}

/**
 * Analyze a resume using pattern matching
 * In a production environment, we would use a more sophisticated AI model
 */
async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  // Extract skills from resume
  const extractedSkills = extractSkillsFromResume(resumeText);
  
  // For demo purposes, we'll provide some realistic-looking data
  // In a real implementation, this would be determined by AI analysis
  const missingSkills = [
    "Advanced State Management",
    "Performance Optimization",
    "Team Leadership",
    "Architecture Design",
    "Technical Documentation"
  ];
  
  const recommendations = [
    "Gain experience with advanced state management libraries like Redux Toolkit or MobX",
    "Practice developing complex UIs with optimized rendering",
    "Take on team leadership responsibilities in current role",
    "Contribute to open source projects to build portfolio",
    "Develop communication skills for technical leadership"
  ];
  
  const suggestedRoles = [
    "Senior Frontend Developer", 
    "Full Stack Engineer", 
    "React Specialist", 
    "UI Developer Team Lead"
  ];
  
  // Extract experience and education using simple heuristics
  const experience = extractExperienceSections(resumeText);
  const education = extractEducationSections(resumeText);
  
  return {
    skills: extractedSkills.length > 0 ? extractedSkills : [
      "JavaScript", "React", "Node.js", "TypeScript", "HTML/CSS", 
      "API Design", "Problem Solving", "Agile/Scrum"
    ],
    experience,
    education,
    suggestedRoles,
    missingSkills,
    recommendations
  };
}

/**
 * Extract experience sections from resume text
 */
function extractExperienceSections(resumeText: string): string[] {
  // In a real implementation, this would use more sophisticated NLP
  // For demo purposes, return a placeholder
  return [
    "Frontend Developer at TechCorp (2020-2023)",
    "Web Developer at StartupX (2018-2020)"
  ];
}

/**
 * Extract education sections from resume text
 */
function extractEducationSections(resumeText: string): string[] {
  // In a real implementation, this would use more sophisticated NLP
  // For demo purposes, return a placeholder
  return [
    "Bachelor of Science, Computer Science, University (2018)"
  ];
} 