import { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, OpenAIApi } from 'openai';

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
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Skills array is required and must not be empty'
      });
    }

    console.log('Generating career recommendations for skills:', skills);
    
    // Generate career recommendations using OpenAI
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

    // Process and structure the response
    const content = response.data.choices[0]?.message?.content;
    
    if (!content) {
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

    // Return the recommendations
    return res.status(200).json({
      status: 'success',
      recommendations
    });
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    
    // Return error status
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 