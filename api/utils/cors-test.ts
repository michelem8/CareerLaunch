import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dedicated CORS test endpoint for handling /api/utils/cors-test requests
 * 
 * This endpoint returns JSON with CORS headers and request debugging information
 * to help diagnose CORS issues in production.
 */
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
  res.setHeader('Content-Type', 'application/json');
  
  // Log request for debugging
  console.log('CORS test request to /api/utils/cors-test:', {
    headers: req.headers,
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
  });
  
  // Return a response with CORS debugging information
  return res.status(200).json({
    success: true,
    message: 'CORS test successful for /api/utils/cors-test',
    endpoint: '/api/utils/cors-test',
    cors: {
      enabled: true,
      origin: origin,
      method: req.method,
    },
    request: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent'],
    },
    response: {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
      }
    },
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
  });
} 