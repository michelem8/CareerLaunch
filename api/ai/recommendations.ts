import { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, OpenAIApi } from 'openai';

// Log OpenAI configuration status
console.log('OpenAI API Key status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
if (process.env.OPENAI_API_KEY) {
  console.log('OpenAI API Key format check:', {
    length: process.env.OPENAI_API_KEY.length,
    startsWithSk: process.env.OPENAI_API_KEY.startsWith('sk-')
  });
}

// Initialize OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received request for AI recommendations');
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({ 
        status: 'error',
        message: 'OpenAI API key is not configured'
      });
    }

    // Get skills from request body
    const { skills } = req.body;
    console.log('Request body:', req.body);
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      console.error('Invalid skills data:', skills);
      return res.status(400).json({ 
        status: 'error',
        message: 'Skills array is required and must not be empty'
      });
    }

    console.log('Generating career recommendations for skills:', skills);
    
    // Generate career recommendations using OpenAI
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a career development expert specializing in career recommendations.
Your task is to generate personalized career development advice based on the user's missing skills.
Be specific, actionable, and practical in your recommendations.`
          },
          {
            role: "user",
            content: `Based on my skill gaps in: ${skills.join(', ')}, what specific career development actions should I take?`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log('OpenAI response received:', JSON.stringify(response.data));

      // Process and structure the response
      const content = response.data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('Empty content in OpenAI response');
        return res.status(500).json({
          status: 'error',
          message: 'No response received from OpenAI'
        });
      }
      
      // Split the content into separate recommendations
      const recommendations = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(item => item.length > 0);
        
      console.log('Processed recommendations:', recommendations);

      // Return the recommendations
      return res.status(200).json({
        status: 'success',
        recommendations
      });
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      
      // Fallback to predefined recommendations if API call fails
      const fallbackRecommendations = [
        "Take online courses to develop skills in the identified gap areas",
        "Join professional communities related to your missing skills",
        "Find a mentor who has expertise in your gap areas",
        "Work on side projects that require using your missing skills",
        "Attend workshops and webinars focused on your skill gaps"
      ];
      
      console.log('Using fallback recommendations due to API error');
      
      return res.status(200).json({
        status: 'success',
        recommendations: fallbackRecommendations,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return error status
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 