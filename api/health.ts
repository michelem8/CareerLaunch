import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check endpoint
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== HEALTH CHECK ENDPOINT CALLED ====');
  
  // Get the request origin
  const origin = req.headers.origin;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return health status
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    request: {
      origin: req.headers.origin,
      host: req.headers.host,
      url: req.url
    }
  });
} 