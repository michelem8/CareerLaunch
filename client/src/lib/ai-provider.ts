import OpenAI from 'openai';

// Get the API URL from environment, with fallback
const apiBaseUrl = import.meta.env.VITE_API_URL || '';
const apiUrl = `${apiBaseUrl}/api/ai`;

console.log('AI Provider initializing with:', {
  baseURL: apiUrl,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.MODE === 'development',
  hasApiUrl: !!apiBaseUrl
});

// Initialize the OpenAI provider with our API key
// In production, this will use the server-side key
export const openai = new OpenAI({
  apiKey: 'placeholder', // Will be replaced by server-side key
  baseURL: apiUrl,  // Path to our API route
  dangerouslyAllowBrowser: true, // Only for development, API calls will go through our backend
  defaultQuery: { timestamp: Date.now().toString() }, // Add a timestamp to prevent caching
  defaultHeaders: { 'X-Client-Source': 'browser' } // Add header for debugging
});

console.log('AI Provider initialized with base URL:', `${import.meta.env.VITE_API_URL || ''}/api/ai`);

// Helper function to generate career recommendations
export async function generateCareerRecommendations(skills: string[]) {
  try {
    console.log('generateCareerRecommendations called with skills:', skills);
    
    if (!skills || skills.length === 0) {
      console.warn('No skills provided to generateCareerRecommendations');
      return { recommendations: [] };
    }

    // Use direct fetch API for more control and debugging
    const endpoint = `${apiUrl}/recommendations`;
    console.log('Making career recommendations request to:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills }),
    });
    
    if (!response.ok) {
      console.error('OpenAI API returned error status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Process and structure the response
    const recommendations = data.recommendations || [];
    
    console.log('Parsed recommendations:', recommendations);
    return { recommendations };
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    
    // Try to get more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if this is an API connection error
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        console.error('Network error detected. API endpoint may be unavailable or CORS issues.');
      }
      
      // Check if this is an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('Authentication error detected. API key may be invalid or missing.');
      }
    }
    
    // Fallback to empty recommendations
    return { recommendations: [] };
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