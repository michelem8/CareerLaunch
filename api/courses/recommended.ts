import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from "openai/resources";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Course interface
interface Course {
  id: string;
  title: string;
  description: string;
  platform: string;
  difficulty: string;
  duration: string;
  skills: string[];
  url: string;
  rating?: number;
  price?: string;
  aiMatchScore?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      const missingSkills = Array.isArray(skills) ? skills.map(s => String(s)) : [String(skills)];
      
      console.log('Requested skills:', missingSkills);
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      
      if (missingSkills.length === 0) {
        return res.status(200).json([]);
      }

      // Mock user data for OpenAI request
      const userData = {
        currentRole: "Product Manager",
        targetRole: "Engineering Manager",
        currentSkills: ["JavaScript", "React", "Product Management"],
        missingSkills: missingSkills,
        preferences: {
          preferredIndustries: ["enterprise-software", "ai-ml"],
          learningStyles: ["practical", "self-paced"],
          timeCommitment: "4-8"
        }
      };

      // Use OpenAI to generate course recommendations
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a career development expert specializing in course recommendations.
Your task is to generate a list of high-quality online courses that would help the user acquire their missing skills.
For each missing skill, recommend 1-2 relevant courses from reputable platforms like Coursera, Udemy, edX, or similar.

You must return a JSON object with the following exact structure:
{
  "courses": [
    {
      "id": "unique-id-1",
      "title": "Course Title",
      "description": "2-3 sentence description",
      "platform": "Platform Name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "Duration (e.g., 6 weeks)",
      "skills": ["Skill 1", "Skill 2"],
      "url": "https://course-url.com",
      "price": "Free|$XX.XX",
      "rating": 4.5,
      "aiMatchScore": 85
    }
  ]
}`
          },
          {
            role: "user",
            content: JSON.stringify(userData)
          }
        ] as ChatCompletionMessageParam[]
      });

      if (!response.choices[0].message?.content) {
        throw new Error("No response received from OpenAI");
      }

      // Parse OpenAI response
      const content = response.choices[0].message.content;
      console.log('Raw OpenAI response:', content);

      // Parse the JSON response
      const parsed = JSON.parse(content);
      if (!parsed.courses || !Array.isArray(parsed.courses)) {
        throw new Error("Invalid response format from OpenAI");
      }

      // Return the course recommendations
      const recommendations = parsed.courses as Course[];
      
      // Sort by AI match score
      const sortedRecommendations = recommendations.sort((a, b) => {
        const scoreA = a.aiMatchScore || 0;
        const scoreB = b.aiMatchScore || 0;
        return scoreB - scoreA;
      });
      
      res.status(200).json(sortedRecommendations);
    } catch (error) {
      console.error('Error getting course recommendations:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get recommended courses',
        details: process.env.NODE_ENV === 'development' ? error : undefined 
      });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
} 