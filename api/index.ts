import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';

// Create a bare minimum Express app
const app = express();

// Add basic middleware
app.use(cors({ origin: '*' }));
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

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Career Launch API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #0070f3; }
        </style>
      </head>
      <body>
        <h1>Career Launch API</h1>
        <p>The API is running. Try visiting the <a href="/api/health">/api/health</a> endpoint.</p>
        <p>Server timestamp: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'Career Launch API',
    path: req.path,
    timestamp: new Date().toISOString()
  });
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