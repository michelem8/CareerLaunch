import { VercelRequest, VercelResponse } from '@vercel/node';
import { openai } from '../../server/openai-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always set CORS headers
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
      const { resumeText, currentRole, targetRole } = req.body;
      console.log('Received resume text for analysis (length):', resumeText?.length || 0);
      console.log('Current role:', currentRole);
      console.log('Target role:', targetRole);
      console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
      
      try {
        // Use OpenAI to analyze the resume
        const analysis = await analyzeResumeWithAI(resumeText);
        console.log('Resume analysis successful:', analysis);
        
        // Generate skill gap analysis using OpenAI
        const skillGap = await generateSkillGapAnalysis(
          analysis.skills || [], 
          targetRole || "", 
          { currentRole: currentRole || "" }
        );
        console.log('Skill gap analysis successful:', skillGap);
        
        // Merge the data
        const mockAnalysis = {
          user: {
            id: 1,
            username: "demo_user",
            resumeAnalysis: {
              ...analysis,
              missingSkills: skillGap.missingSkills,
              recommendations: skillGap.recommendations,
              suggestedRoles: analysis.suggestedRoles || []
            }
          },
          skillGap
        };
        
        res.status(200).json(mockAnalysis);
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        
        // Fall back to static analysis if OpenAI fails
        const staticAnalysis = generateStaticAnalysis(resumeText, currentRole, targetRole);
        console.log('Using static fallback analysis:', staticAnalysis);
        
        res.status(200).json(staticAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to analyze resume' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function analyzeResumeWithAI(resumeText: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career advisor specializing in analyzing resumes and suggesting career paths. Extract key information from the resume and return it in JSON format with the following structure:
{
  "skills": string[],
  "experience": string[],
  "education": string[],
  "suggestedRoles": string[]
}

Guidelines:
1. Extract technical and soft skills mentioned in the resume
2. Format experience entries as "Job Title at Company (YYYY-YYYY)"
3. Format education entries as "Degree, Institution (YYYY)"
4. Suggest 3-5 realistic roles based on their experience and skills
5. Be comprehensive but concise
6. Ensure all dates and titles are accurate`
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in AI resume analysis:", error);
    throw error;
  }
}

async function generateSkillGapAnalysis(skills: string[], targetRole: string, user: { currentRole: string }) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career development expert. Analyze the provided skills and target role to identify skill gaps and provide recommendations. Return a JSON object with:
{
  "missingSkills": string[], // 5-7 critical skills they should develop for the target role
  "recommendations": string[] // 3-5 specific, actionable recommendations for career progression
}

Guidelines:
1. Focus on both technical and soft skills needed for the target role
2. Consider industry trends and job market demands
3. Provide specific, actionable recommendations
4. Prioritize skills that would have the most impact
5. Consider the candidate's current skills and role when making recommendations`
        },
        {
          role: "user",
          content: JSON.stringify({
            currentRole: user.currentRole,
            targetRole: targetRole,
            currentSkills: skills
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in skill gap analysis:", error);
    throw error;
  }
}

// Static fallback function for when OpenAI is not available
function generateStaticAnalysis(resumeText: string, currentRole?: string, targetRole?: string) {
  console.log('Using static analysis with roles:', { currentRole, targetRole });
  
  // Extract simple skills from text
  const skills = extractBasicSkills(resumeText);
  
  // Determine career path based on roles or extracted skills
  const careerPath = determineCareerPath(currentRole, targetRole, skills);
  
  // Generate recommendations based on career path
  const recommendations = getRecommendationsForPath(careerPath);
  const missingSkills = getMissingSkillsForPath(careerPath);
  const suggestedRoles = getSuggestedRolesForPath(careerPath);
  
  return {
    user: {
      id: 1,
      username: "demo_user",
      resumeAnalysis: {
        skills,
        experience: extractBasicExperience(resumeText),
        education: extractBasicEducation(resumeText),
        missingSkills,
        recommendations,
        suggestedRoles
      }
    },
    skillGap: {
      missingSkills,
      recommendations
    }
  };
}

function extractBasicSkills(text: string): string[] {
  const commonSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "HTML", "CSS", 
    "SQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git",
    "Project Management", "Agile", "Scrum", "Leadership", "Communication",
    "Product Development", "UI/UX", "Data Analysis", "Machine Learning"
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 10);
}

function extractBasicExperience(text: string): string[] {
  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());
  const experienceItems = [];
  
  for (const year of years) {
    if (text.includes(year)) {
      experienceItems.push(`Experience from ${year}`);
      if (experienceItems.length >= 3) break;
    }
  }
  
  return experienceItems;
}

function extractBasicEducation(text: string): string[] {
  const degrees = ["Bachelor", "Master", "MBA", "PhD", "Degree", "BS", "MS", "BA", "Certificate"];
  const educationItems = [];
  
  for (const degree of degrees) {
    if (text.toLowerCase().includes(degree.toLowerCase())) {
      educationItems.push(`${degree} degree`);
      if (educationItems.length >= 2) break;
    }
  }
  
  return educationItems;
}

function determineCareerPath(currentRole?: string, targetRole?: string, skills: string[] = []): string {
  const lowerCurrentRole = currentRole?.toLowerCase() || '';
  const lowerTargetRole = targetRole?.toLowerCase() || '';
  const lowerSkills = skills.map(s => s.toLowerCase());
  
  if (lowerTargetRole.includes('manager') || lowerTargetRole.includes('lead') || lowerTargetRole.includes('director')) {
    return "management";
  }
  
  if (lowerTargetRole.includes('front') || lowerTargetRole.includes('ui') || lowerTargetRole.includes('ux')) {
    return "frontend";
  }
  
  if (lowerTargetRole.includes('back') || lowerTargetRole.includes('api') || lowerTargetRole.includes('server')) {
    return "backend";
  }
  
  if (lowerTargetRole.includes('data') || lowerTargetRole.includes('ml') || lowerTargetRole.includes('ai')) {
    return "data";
  }
  
  // Fall back to skills-based determination
  if (lowerSkills.some(s => s.includes("react") || s.includes("angular") || s.includes("frontend") || s.includes("ui") || s.includes("css"))) {
    return "frontend";
  }
  
  if (lowerSkills.some(s => s.includes("node") || s.includes("api") || s.includes("backend") || s.includes("database"))) {
    return "backend";
  }
  
  if (lowerSkills.some(s => s.includes("manage") || s.includes("lead") || s.includes("direct"))) {
    return "management";
  }
  
  return "technical"; // Default
}

function getRecommendationsForPath(careerPath: string): string[] {
  const recommendations: Record<string, string[]> = {
    technical: [
      "Develop a deeper understanding of system design principles",
      "Build projects that demonstrate scalability concepts",
      "Learn cloud architecture and deployment strategies",
      "Practice solving complex technical problems",
      "Contribute to open-source projects"
    ],
    frontend: [
      "Build a portfolio of responsive web applications",
      "Study advanced UI/UX principles",
      "Learn modern frontend frameworks in depth",
      "Practice implementing accessible designs",
      "Develop component libraries and design systems"
    ],
    backend: [
      "Design and implement RESTful and GraphQL APIs",
      "Learn database optimization techniques",
      "Study server scaling and deployment strategies",
      "Develop microservice architectures",
      "Practice implementing authentication and security"
    ],
    management: [
      "Focus on team building and leadership skills",
      "Develop deeper technical architecture knowledge",
      "Practice making technical decisions at scale",
      "Learn about team dynamics and management",
      "Build cross-functional communication skills"
    ],
    data: [
      "Build data analysis and visualization projects",
      "Develop machine learning models",
      "Study big data processing frameworks",
      "Learn statistical analysis techniques",
      "Practice communicating insights from data"
    ]
  };
  
  return recommendations[careerPath] || recommendations.technical;
}

function getMissingSkillsForPath(careerPath: string): string[] {
  const missingSkills: Record<string, string[]> = {
    technical: [
      "System Design",
      "Scalability Patterns",
      "Cloud Architecture",
      "Distributed Systems",
      "Performance Optimization"
    ],
    frontend: [
      "Advanced React Patterns",
      "UI/UX Design Principles", 
      "Responsive Web Design",
      "State Management",
      "Accessibility Standards"
    ],
    backend: [
      "API Design",
      "Database Optimization",
      "Server Scaling",
      "Microservices",
      "Security Practices"
    ],
    management: [
      "Engineering Leadership",
      "Team Building",
      "Technical Architecture",
      "Cross-functional Communication",
      "Project Management"
    ],
    data: [
      "Data Analysis",
      "Machine Learning",
      "Statistical Methods",
      "Big Data Processing",
      "Data Visualization"
    ]
  };
  
  return missingSkills[careerPath] || missingSkills.technical;
}

function getSuggestedRolesForPath(careerPath: string): string[] {
  const suggestedRoles: Record<string, string[]> = {
    technical: [
      "Software Engineer",
      "System Architect",
      "DevOps Engineer",
      "Full Stack Developer"
    ],
    frontend: [
      "Frontend Developer",
      "UI Engineer",
      "React Developer",
      "UX Engineer"
    ],
    backend: [
      "Backend Developer",
      "API Engineer",
      "System Developer",
      "Database Engineer"
    ],
    management: [
      "Engineering Manager",
      "Technical Team Lead",
      "Product Manager",
      "CTO"
    ],
    data: [
      "Data Scientist",
      "Data Engineer",
      "Machine Learning Engineer",
      "Data Analyst"
    ]
  };
  
  return suggestedRoles[careerPath] || suggestedRoles.technical;
}

// Helper function to extract skills from resume text
function extractSkillsFromResume(resumeText: string): string[] {
  // Common tech skills to look for
  const commonSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "HTML", "CSS", 
    "SQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git",
    "Project Management", "Agile", "Scrum", "Leadership", "Communication",
    "Product Development", "UI/UX", "Data Analysis", "Machine Learning"
  ];
  
  // Check which skills are mentioned in the resume
  const foundSkills = commonSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Ensure we return at least some skills
  if (foundSkills.length < 5) {
    // If too few skills found, add some generic ones based on text content
    if (resumeText.toLowerCase().includes("manag")) {
      foundSkills.push("Management", "Leadership", "Team Building");
    }
    if (resumeText.toLowerCase().includes("develop")) {
      foundSkills.push("Software Development", "Programming");
    }
    if (resumeText.toLowerCase().includes("design")) {
      foundSkills.push("Design Thinking", "UI/UX");
    }
    if (resumeText.toLowerCase().includes("data")) {
      foundSkills.push("Data Analysis", "Analytics");
    }
  }
  
  // Return unique skills (remove duplicates)
  return [...new Set(foundSkills)].slice(0, 10); // Limit to 10 skills
}

// Extract experience from resume text
function extractExperienceFromResume(resumeText: string): string[] {
  const experience: string[] = [];
  
  // Look for common experience patterns
  const lines = resumeText.split('\n');
  
  for (const line of lines) {
    // Look for lines that might indicate job experience (contains years, job titles, etc.)
    if (
      (line.match(/\b(19|20)\d{2}\b/) && line.match(/\b(19|20)\d{2}\b/g)!.length >= 2) || // Contains two years
      (line.match(/\b(19|20)\d{2}\b/) && (line.includes("present") || line.includes("current"))) || // Contains year and "present"
      (/(Senior|Lead|Director|Manager|Engineer|Developer|Designer)\b/.test(line) && /\bat\b/.test(line)) // Job title + "at"
    ) {
      if (line.trim().length > 10) { // Avoid short lines
        experience.push(line.trim());
      }
    }
  }
  
  // If no experience found, create placeholder
  if (experience.length === 0) {
    const jobTitles = ["Senior Developer", "Product Manager", "Project Lead", "Software Engineer"];
    const companies = ["Tech Company", "Software Inc", "Digital Solutions", "Innovative Systems"];
    const randomTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    
    experience.push(`${randomTitle} at ${randomCompany} (2018-2023)`);
    experience.push(`Junior Developer at Start-up Technologies (2015-2018)`);
  }
  
  return experience.slice(0, 3); // Limit to 3 experiences
}

// Extract education from resume text
function extractEducationFromResume(resumeText: string): string[] {
  const education: string[] = [];
  
  // Look for common education patterns
  const lines = resumeText.split('\n');
  
  for (const line of lines) {
    // Look for lines that might indicate education (contains degrees, universities, etc.)
    if (
      /\b(Bachelor|Master|PhD|BS|MS|BA|MA|BSc|MSc|MBA)\b/.test(line) || 
      /\b(University|College|School|Institute)\b/.test(line) ||
      /\b(degree|diploma)\b/.test(line)
    ) {
      if (line.trim().length > 10) { // Avoid short lines
        education.push(line.trim());
      }
    }
  }
  
  // If no education found, create placeholder
  if (education.length === 0) {
    education.push("BS Computer Science, University (2012)");
    education.push("MBA, Business School (2015)");
  }
  
  return education.slice(0, 2); // Limit to 2 education entries
}

// Generate missing skills based on the skills found in the resume
function generateMissingSkills(extractedSkills: string[]): string[] {
  // Define common skills gaps based on different career paths
  const skillGaps: Record<string, string[]> = {
    technical: [
      "System Design", "Scalability", "Cloud Architecture", 
      "Microservices", "Distributed Systems", "DevOps"
    ],
    frontend: [
      "React", "Angular", "Vue.js", "Responsive Design", 
      "Accessibility", "UI/UX", "CSS Frameworks"
    ],
    backend: [
      "Node.js", "Python", "Java", "Database Design", 
      "API Development", "Server Management", "Caching"
    ],
    management: [
      "Team Leadership", "Project Management", "Agile", 
      "Cross-functional Communication", "Stakeholder Management"
    ],
    design: [
      "User Research", "Wireframing", "Prototyping", 
      "Design Systems", "Information Architecture"
    ],
    data: [
      "Data Analysis", "Python", "SQL", "Big Data", 
      "Data Visualization", "Machine Learning", "Statistics"
    ]
  };
  
  // Lowercase all extracted skills for comparison
  const lowerSkills = extractedSkills.map(s => s.toLowerCase());
  
  // Determine career path based on skills
  let careerPath = "technical"; // Default
  
  if (lowerSkills.some(s => s.includes("manag") || s.includes("lead") || s.includes("direct"))) {
    careerPath = "management";
  } else if (lowerSkills.some(s => s.includes("react") || s.includes("angular") || s.includes("frontend") || s.includes("ui") || s.includes("css"))) {
    careerPath = "frontend";
  } else if (lowerSkills.some(s => s.includes("node") || s.includes("api") || s.includes("backend") || s.includes("database"))) {
    careerPath = "backend";
  } else if (lowerSkills.some(s => s.includes("design") || s.includes("ux") || s.includes("user"))) {
    careerPath = "design";
  } else if (lowerSkills.some(s => s.includes("data") || s.includes("analy") || s.includes("machine") || s.includes("python"))) {
    careerPath = "data";
  }
  
  // Get skills from career path that don't exist in extracted skills
  const missing = skillGaps[careerPath].filter(skill => 
    !lowerSkills.some(s => s.includes(skill.toLowerCase()))
  );
  
  // Always include some leadership/management skills
  const leadershipSkills = ["Engineering Leadership", "Team Building", "Technical Architecture", "Strategic Thinking"];
  
  return [...missing, ...leadershipSkills].slice(0, 5); // Return 5 missing skills
}

// Generate recommendations based on missing skills
function generateRecommendations(extractedSkills: string[]): string[] {
  // Recommendations based on common career paths
  const recommendations: Record<string, string[]> = {
    technical: [
      "Develop a deeper understanding of system design principles",
      "Build projects that demonstrate scalability concepts",
      "Learn cloud architecture and deployment strategies",
      "Practice solving complex technical problems",
      "Contribute to open-source projects"
    ],
    frontend: [
      "Build a portfolio of responsive web applications",
      "Study advanced UI/UX principles",
      "Learn modern frontend frameworks in depth",
      "Practice implementing accessible designs",
      "Develop component libraries and design systems"
    ],
    backend: [
      "Design and implement RESTful and GraphQL APIs",
      "Learn database optimization techniques",
      "Study server scaling and deployment strategies",
      "Develop microservice architectures",
      "Practice implementing authentication and security"
    ],
    management: [
      "Focus on team building and leadership skills",
      "Develop deeper technical architecture knowledge",
      "Practice making technical decisions at scale",
      "Learn about team dynamics and management",
      "Build cross-functional communication skills"
    ],
    design: [
      "Conduct user research and usability testing",
      "Create a portfolio of design case studies",
      "Learn interface design best practices",
      "Study information architecture principles",
      "Practice data-driven design decisions"
    ],
    data: [
      "Build data analysis and visualization projects",
      "Develop machine learning models",
      "Study big data processing frameworks",
      "Learn statistical analysis techniques",
      "Practice communicating insights from data"
    ]
  };
  
  // Lowercase all extracted skills for comparison
  const lowerSkills = extractedSkills.map(s => s.toLowerCase());
  
  // Determine career path based on skills
  let careerPath = "technical"; // Default
  
  if (lowerSkills.some(s => s.includes("manag") || s.includes("lead") || s.includes("direct"))) {
    careerPath = "management";
  } else if (lowerSkills.some(s => s.includes("react") || s.includes("angular") || s.includes("frontend") || s.includes("ui") || s.includes("css"))) {
    careerPath = "frontend";
  } else if (lowerSkills.some(s => s.includes("node") || s.includes("api") || s.includes("backend") || s.includes("database"))) {
    careerPath = "backend";
  } else if (lowerSkills.some(s => s.includes("design") || s.includes("ux") || s.includes("user"))) {
    careerPath = "design";
  } else if (lowerSkills.some(s => s.includes("data") || s.includes("analy") || s.includes("machine") || s.includes("python"))) {
    careerPath = "data";
  }
  
  return recommendations[careerPath];
}

// Generate suggested roles based on skills
function generateSuggestedRoles(extractedSkills: string[]): string[] {
  // Role suggestions based on skill sets
  const roleSuggestions: Record<string, string[]> = {
    technical: [
      "Software Engineer", "System Architect", "DevOps Engineer", "Full Stack Developer"
    ],
    frontend: [
      "Frontend Developer", "UI Engineer", "React Developer", "UX Engineer"
    ],
    backend: [
      "Backend Developer", "API Engineer", "System Developer", "Database Engineer"
    ],
    management: [
      "Engineering Manager", "Technical Team Lead", "Product Manager", "CTO"
    ],
    design: [
      "UX Designer", "Product Designer", "UI Designer", "Interaction Designer"
    ],
    data: [
      "Data Scientist", "Data Engineer", "Machine Learning Engineer", "Data Analyst"
    ]
  };
  
  // Lowercase all extracted skills for comparison
  const lowerSkills = extractedSkills.map(s => s.toLowerCase());
  
  // Determine career path based on skills
  let careerPath = "technical"; // Default
  
  if (lowerSkills.some(s => s.includes("manag") || s.includes("lead") || s.includes("direct"))) {
    careerPath = "management";
  } else if (lowerSkills.some(s => s.includes("react") || s.includes("angular") || s.includes("frontend") || s.includes("ui") || s.includes("css"))) {
    careerPath = "frontend";
  } else if (lowerSkills.some(s => s.includes("node") || s.includes("api") || s.includes("backend") || s.includes("database"))) {
    careerPath = "backend";
  } else if (lowerSkills.some(s => s.includes("design") || s.includes("ux") || s.includes("user"))) {
    careerPath = "design";
  } else if (lowerSkills.some(s => s.includes("data") || s.includes("analy") || s.includes("machine") || s.includes("python"))) {
    careerPath = "data";
  }
  
  return roleSuggestions[careerPath];
} 