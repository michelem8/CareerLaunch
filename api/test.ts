import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple test endpoint to diagnose serverless environment issues
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== TEST ENDPOINT CALLED ====');
  
  // Get the request origin
  const origin = req.headers.origin;
  
  // Allow both www and non-www domains
  const allowedOrigins = [
    'https://careerpathfinder.io',
    'https://www.careerpathfinder.io'
  ];
  
  // Set origin based on the request or default to the first allowed origin
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
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

  // Prepare diagnostics data
  const diagnosticData = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'unknown',
    method: req.method,
    url: req.url,
    headers: req.headers,
    cors: {
      allowedOrigins,
      requestOrigin: origin,
      responseOrigin: corsOrigin
    },
    serverInfo: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      memoryUsage: process.memoryUsage(),
    }
  };

  console.log('Diagnostic data:', JSON.stringify(diagnosticData, null, 2));
  
  // Return success with diagnostic information
  res.status(200).json({
    success: true,
    message: 'Test endpoint is working',
    diagnostics: diagnosticData
  });
} 