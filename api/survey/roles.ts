import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentRole, targetRole } = req.body;

    // Validate required fields
    if (!currentRole || !targetRole) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          currentRole: !currentRole ? 'Current role is required' : undefined,
          targetRole: !targetRole ? 'Target role is required' : undefined,
        }
      });
    }

    // Process the roles (add your business logic here)
    // For now, we'll just echo back the data
    return res.status(200).json({
      success: true,
      data: {
        currentRole,
        targetRole,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing survey roles:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
} 