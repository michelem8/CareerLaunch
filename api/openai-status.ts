import { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://careerpathfinder.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        status: 'error',
        message: 'OpenAI API key is not configured',
        configured: false
      });
    }

    // Initialize OpenAI client
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Make a simple request to check connectivity
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Hello, are you accessible?",
      max_tokens: 5
    });

    // Return success status
    return res.status(200).json({
      status: 'success',
      message: 'OpenAI API is properly configured and accessible',
      configured: true,
      test_response: completion.data.choices[0].text
    });
  } catch (error) {
    console.error('OpenAI connectivity check failed:', error);
    
    // Return error status
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      configured: !!process.env.OPENAI_API_KEY,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 