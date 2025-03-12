import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple test endpoint to diagnose serverless environment issues
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('==== TEST ENDPOINT CALLED ====');
  
  // Get the request origin
  const origin = req.headers.origin;
  
  // Set CORS headers - allow all origins in production for testing
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

  // Prepare diagnostics data
  const diagnosticData = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'unknown',
    method: req.method,
    url: req.url,
    headers: req.headers,
    cors: {
      requestOrigin: origin,
      responseOrigin: origin || '*'
    },
    serverInfo: {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      memoryUsage: process.memoryUsage(),
    }
  };

  console.log('Diagnostic data:', JSON.stringify(diagnosticData, null, 2));
  
  // Return test response
  res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    requestInfo: {
      method: req.method,
      url: req.url,
      headers: req.headers,
    }
  });
} 