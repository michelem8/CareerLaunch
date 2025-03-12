import { VercelRequest, VercelResponse } from '@vercel/node';

// Utility endpoint that combines multiple test-related functions
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
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

  // Route to appropriate function based on path
  const path = req.url?.split('?')[0];
  
  if (path === '/api/utils/hello') {
    return handleHello(req, res);
  } else if (path === '/api/utils/test') {
    return handleTest(req, res);
  } else if (path === '/api/utils/cors-test') {
    return handleCorsTest(req, res);
  } else if (path === '/api/utils/openai-status') {
    return handleOpenAIStatus(req, res);
  } else if (path === '/api/utils/health') {
    return handleHealth(req, res);
  }

  // Default response for unmatched paths
  res.status(404).json({ error: 'Utility endpoint not found' });
}

// Previously in hello.ts
function handleHello(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: 'Hello from Vercel!' });
}

// Previously in test.ts
function handleTest(req: VercelRequest, res: VercelResponse) {
  console.log('==== TEST ENDPOINT CALLED ====');
  
  // Prepare diagnostics data
  const diagnosticData = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'unknown',
    method: req.method,
    url: req.url,
    headers: req.headers,
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

// Previously in cors-test.ts
function handleCorsTest(req: VercelRequest, res: VercelResponse) {
  // Log full request details
  console.log('CORS test request:', {
    headers: req.headers,
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
  });

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

// Health check endpoint
function handleHealth(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}

// OpenAI status check (placeholder)
function handleOpenAIStatus(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    available: true,
    models: ["gpt-4", "gpt-3.5-turbo"],
    status: "operational",
    timestamp: new Date().toISOString()
  });
} 