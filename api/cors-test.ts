import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  const origin = req.headers.origin || '*';
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end();
  }
  
  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Return a response with CORS debugging information
  return res.status(200).json({
    success: true,
    message: 'CORS test successful',
    cors: {
      enabled: true,
      origin: origin,
      method: req.method,
    },
    headers: {
      received: req.headers,
      sent: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
      }
    },
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'unknown',
  });
} 