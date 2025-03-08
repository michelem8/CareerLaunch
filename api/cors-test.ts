import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Log full request details
  console.log('CORS test request:', {
    headers: req.headers,
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
  });

  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://careerpathfinder.io');
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

  // Return CORS test information
  res.status(200).json({
    success: true,
    message: 'CORS is working correctly',
    request: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent'],
    },
    cors: {
      allowOrigin: res.getHeader('Access-Control-Allow-Origin'),
      allowCredentials: res.getHeader('Access-Control-Allow-Credentials'),
      allowMethods: res.getHeader('Access-Control-Allow-Methods'),
      allowHeaders: res.getHeader('Access-Control-Allow-Headers'),
    },
    timestamp: new Date().toISOString()
  });
} 