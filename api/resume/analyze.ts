import { VercelRequest, VercelResponse } from '@vercel/node';

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
      const { resumeText, currentRole, targetRole } = req.body;
      console.log('Received resume text for analysis (length):', resumeText?.length || 0);
      console.log('Current role:', currentRole);
      console.log('Target role:', targetRole);

      // Create a mock analysis response
      const mockAnalysis = {
        user: {
          id: 1,
          username: "demo_user",
          resumeAnalysis: {
            skills: [
              "JavaScript", 
              "React", 
              "Node.js", 
              "TypeScript", 
              "HTML/CSS", 
              "API Design", 
              "Problem Solving", 
              "Agile/Scrum"
            ],
            experience: [
              "Frontend Developer at TechCorp (2020-2023)",
              "Web Developer at StartupX (2018-2020)"
            ],
            education: [
              "Bachelor of Science, Computer Science, University (2018)"
            ],
            suggestedRoles: [
              "Senior Frontend Developer", 
              "Full Stack Engineer", 
              "React Specialist", 
              "UI Developer Team Lead"
            ],
            missingSkills: [
              "Advanced State Management",
              "Performance Optimization",
              "Team Leadership",
              "Architecture Design",
              "Technical Documentation"
            ],
            recommendations: [
              "Gain experience with advanced state management libraries like Redux Toolkit or MobX",
              "Practice developing complex UIs with optimized rendering",
              "Take on team leadership responsibilities in current role",
              "Contribute to open source projects to build portfolio",
              "Develop communication skills for technical leadership"
            ]
          }
        },
        skillGap: {
          missingSkills: [
            "Advanced State Management",
            "Performance Optimization",
            "Team Leadership",
            "Architecture Design",
            "Technical Documentation"
          ],
          recommendations: [
            "Gain experience with advanced state management libraries like Redux Toolkit or MobX",
            "Practice developing complex UIs with optimized rendering",
            "Take on team leadership responsibilities in current role",
            "Contribute to open source projects to build portfolio",
            "Develop communication skills for technical leadership"
          ]
        }
      };

      console.log('Sending mock analysis response');
      res.status(200).json(mockAnalysis);
    } catch (error) {
      console.error('Error in simplified resume analysis endpoint:', error);
      console.error('Full error details:', error instanceof Error ? error.stack : 'No stack trace');
      
      res.status(500).json({ 
        error: { 
          code: '500', 
          message: 'A server error has occurred',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
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