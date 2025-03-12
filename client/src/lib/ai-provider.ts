import OpenAI from 'openai';

// Initialize the OpenAI provider with our API key
// In production, this will use the server-side API key
export const openai = new OpenAI({
  apiKey: 'placeholder', // Will be replaced by server-side key
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/ai`,  // Path to our API route
  dangerouslyAllowBrowser: true // Only for development, API calls will go through our backend
});

// Helper function to generate career recommendations
export async function generateCareerRecommendations(skills: string[]) {
  try {
    if (!skills || skills.length === 0) {
      return { recommendations: [] };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a career development expert specializing in career recommendations.
Your task is to generate personalized career development advice based on the user's missing skills.
Be specific, actionable, and practical in your recommendations.`
        },
        {
          role: 'user',
          content: `Based on my skill gaps in: ${skills.join(', ')}, what specific career development actions should I take?`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Process and structure the response
    const recommendations = response.choices[0]?.message?.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(item => item.length > 0) || [];

    return { recommendations };
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    throw error;
  }
}

// Helper function to generate course recommendations
export async function generateCourseRecommendations(missingSkills: string[]) {
  try {
    if (!missingSkills || missingSkills.length === 0) {
      return { courses: [] };
    }

    // Mock user data for better recommendations
    const userData = {
      missingSkills: missingSkills,
      preferences: {
        preferredIndustries: ["enterprise-software", "ai-ml"],
        learningStyles: ["practical", "self-paced"],
        timeCommitment: "4-8"
      }
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
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
          role: 'user',
          content: JSON.stringify(userData)
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("No content received from OpenAI");
      return { courses: [] };
    }

    try {
      // Parse the JSON response
      const parsed = JSON.parse(content);
      if (!parsed.courses || !Array.isArray(parsed.courses)) {
        console.warn("Invalid response format from OpenAI:", content);
        return { courses: [] };
      }

      // Sort by AI match score
      const sortedRecommendations = parsed.courses.sort((a: any, b: any) => {
        const scoreA = a.aiMatchScore || 0;
        const scoreB = b.aiMatchScore || 0;
        return scoreB - scoreA;
      });

      return { courses: sortedRecommendations };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      return { courses: [] };
    }
  } catch (error) {
    console.error('Error generating course recommendations:', error);
    // Return empty array in case of error
    return { courses: [] };
  }
} 