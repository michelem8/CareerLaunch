import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Create a bare minimum Express app
const app = express();

// Add basic middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://careerpathfinder.io',
    'https://www.careerpathfinder.io',
    'https://api.careerpathfinder.io'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));
app.use(express.json());

// Simple request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Add CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).json({ 
    success: true, 
    message: 'CORS is working correctly',
    request: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer
    },
    timestamp: new Date().toISOString()
  });
});

// Setup static file serving from dist/public
const publicDir = path.join(process.cwd(), 'dist', 'public');
if (fs.existsSync(publicDir)) {
  console.log(`Serving static files from ${publicDir}`);
  app.use(express.static(publicDir));
} else {
  console.warn(`Public directory not found at ${publicDir}`);
}

// Serve client app for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Try to serve index.html
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html from ${indexPath}`);
    return res.sendFile(indexPath);
  }
  
  // Fallback to inline HTML
  console.log('Serving fallback HTML');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Career Launch</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #0070f3; }
        </style>
      </head>
      <body>
        <h1>Career Launch</h1>
        <p>The application is loading...</p>
        <p>If you continue to see this page, please check the deployment logs.</p>
        <p>Server timestamp: ${new Date().toISOString()}</p>
        <p><a href="/api/health">Check API Status</a></p>
      </body>
    </html>
  `);
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Vercel serverless handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`Starting handler for ${req.method} ${req.url}`);
  
  try {
    // Forward the request to Express
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error('Express error:', err);
        res.status(500).json({ error: 'Express error' });
      }
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Handler error' });
  }
} 