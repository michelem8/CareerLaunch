import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Create a bare minimum Express app
const app = express();

// Add basic middleware
app.use(cors({
  origin: 'https://careerpathfinder.io', // Simplified to focus on main production domain
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

// Ensure CORS headers are set for every response
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://careerpathfinder.io');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
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

// Add some direct API routes for critical endpoints
app.get('/api/users/me', (req, res) => {
  console.log('Direct handler for /api/users/me');
  // Set CORS headers explicitly
  res.setHeader('Access-Control-Allow-Origin', 'https://careerpathfinder.io');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  const mockUser = {
    id: 1,
    username: "demo_user",
    currentRole: "Product Manager",
    targetRole: "Engineering Manager",
    skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
    surveyCompleted: true,
    hasCompletedSurvey: true,
    resumeAnalysis: {
      skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
      experience: [
        "Senior Product Manager at Tech Company (2018-2023)",
        "Product Manager at Software Inc (2015-2018)"
      ],
      education: [
        "MBA, Business School (2015)",
        "BS Computer Science, University (2012)"
      ],
      missingSkills: [
        "Engineering Leadership",
        "Team Building", 
        "Technical Architecture",
        "Cross-functional Communication"
      ],
      recommendations: [
        "Focus on team building and leadership skills",
        "Develop deeper technical architecture knowledge",
        "Practice making technical decisions at scale"
      ],
      suggestedRoles: ["Technical Product Manager", "Engineering Manager", "Development Team Lead"]
    },
    preferences: {
      preferredIndustries: ["enterprise-software", "ai-ml"],
      learningStyles: ["practical", "self-paced"],
      timeCommitment: "4-8"
    }
  };
  
  res.status(200).json(mockUser);
});

// Add direct handler for roles endpoint
app.post('/api/survey/roles', (req, res) => {
  console.log('Direct handler for /api/survey/roles', req.body);
  
  try {
    // Set CORS headers explicitly for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Check for required fields
    if (!req.body || typeof req.body.currentRole !== 'string' || typeof req.body.targetRole !== 'string') {
      return res.status(400).json({
        error: 'Invalid request format',
        details: 'Both currentRole and targetRole must be provided as strings'
      });
    }
    
    // Update user roles logic would go here in a real app
    const mockResponse = {
      id: 1,
      username: "demo_user",
      currentRole: req.body.currentRole,
      targetRole: req.body.targetRole,
      skills: [],
      updatedAt: new Date().toISOString()
    };
    
    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error in /api/survey/roles handler:', error);
    
    let errorMessage = 'Failed to process request';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Add direct handler for survey complete as a fallback
app.post('/api/survey/complete', (req, res) => {
  console.log('Direct handler for /api/survey/complete');
  // Set CORS headers explicitly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  const mockUser = {
    id: 1,
    username: "demo_user",
    currentRole: "Product Manager",
    targetRole: "Engineering Manager",
    skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
    surveyCompleted: true,
    hasCompletedSurvey: true,
    resumeAnalysis: {
      skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
      experience: [
        "Senior Product Manager at Tech Company (2018-2023)",
        "Product Manager at Software Inc (2015-2018)"
      ],
      education: [
        "MBA, Business School (2015)",
        "BS Computer Science, University (2012)"
      ],
      missingSkills: [
        "Engineering Leadership",
        "Team Building", 
        "Technical Architecture",
        "Cross-functional Communication"
      ],
      recommendations: [
        "Focus on team building and leadership skills",
        "Develop deeper technical architecture knowledge",
        "Practice making technical decisions at scale"
      ],
      suggestedRoles: ["Technical Product Manager", "Engineering Manager", "Development Team Lead"]
    },
    preferences: {
      preferredIndustries: ["enterprise-software", "ai-ml"],
      learningStyles: ["practical", "self-paced"],
      timeCommitment: "4-8"
    }
  };
  
  res.status(200).json(mockUser);
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
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight requests
    res.setHeader('Access-Control-Allow-Origin', 'https://careerpathfinder.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
    return;
  }
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://careerpathfinder.io');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
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