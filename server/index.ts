import express, { type Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import cors from "cors";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

// Use __dirname directly since we're using Node.js environment
const __dirname = path.resolve();

// Load environment variables from .env file
config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

if (!process.env.RAPID_API_KEY) {
  console.error("Error: RAPID_API_KEY is not set in environment variables");
  process.exit(1);
}

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Configure CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://careerpathfinder.io',
      'https://www.careerpathfinder.io',
      'https://api.careerpathfinder.io'
    ] 
  : ['http://localhost:5173']; // Vite's default development port

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.warn(`Origin rejected by CORS policy: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Add a debug endpoint to check CORS headers
app.options('/api/test', (req, res) => {
  res.status(200).end();
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working correctly',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Simple request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  
  // Special handling for OPTIONS/preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Received preflight request:', {
      origin: req.headers.origin,
      path: req.path,
      accessControlRequestMethod: req.headers['access-control-request-method'],
      accessControlRequestHeaders: req.headers['access-control-request-headers']
    });
  }
  
  next();
});

// Middleware to ensure no unnecessary redirects for preflight requests
app.use((req, res, next) => {
  // Skip redirects for OPTIONS requests to prevent CORS preflight issues
  if (req.method === 'OPTIONS') {
    // Set proper CORS headers directly
    const origin = req.headers.origin;
    
    // Check if origin is allowed
    if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production')) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Respond immediately with 204 No Content
    return res.status(204).end();
  }
  
  next();
});

// Initialize default user
async function initializeDefaultUser() {
  try {
    const defaultUser = await storage.createUser({
      username: "demo_user",
      password: "demo_password"
    });
    console.log("Default user initialized:", defaultUser);
  } catch (error) {
    console.error("Error initializing default user:", error);
  }
}

// Start server setup
(async () => {
  try {
    await initializeDefaultUser();
    
    // Add health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'healthy' });
    });

    // Enhanced CORS test endpoint with detailed diagnostics
    app.get('/api/cors-test', (req, res) => {
      // Ensure CORS headers are set for this response
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      // Return detailed information about the request
      res.status(200).json({ 
        success: true, 
        message: 'CORS is working correctly',
        request: {
          origin: req.headers.origin,
          host: req.headers.host,
          referer: req.headers.referer,
          userAgent: req.headers['user-agent']
        },
        server: {
          time: new Date().toISOString(),
          nodeEnv: process.env.NODE_ENV,
          cors: {
            allowedOrigins: [
              'https://www.careerpathfinder.io',
              'https://careerpathfinder.io',
              'https://api.careerpathfinder.io'
            ],
            credentialsSupported: true
          }
        }
      });
    });

    // Echo request headers for debugging
    app.get('/api/debug/headers', (req, res) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      res.status(200).json({
        headers: req.headers,
        method: req.method,
        url: req.url,
        path: req.path
      });
    });

    // Register API routes first
    const httpServer = await registerRoutes(app);

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    });

    // Setup static file serving
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, httpServer);
    } else {
      // Serve static files in production
      serveStatic(app);
      
      // Log environment and process info
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
      console.log('Current directory:', process.cwd());
      console.log('Files in current directory:', fs.readdirSync(process.cwd()));
      
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        console.log('Files in dist directory:', fs.readdirSync(path.join(process.cwd(), 'dist')));
      }
      
      if (fs.existsSync(path.join(process.cwd(), 'dist', 'public'))) {
        console.log('Files in dist/public directory:', fs.readdirSync(path.join(process.cwd(), 'dist', 'public')));
      }
    }

    // Start the server
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('CORS origin:', process.env.NODE_ENV === 'production' 
        ? ['https://careerpathfinder.io', 'https://www.careerpathfinder.io']
        : 'http://localhost:5173'
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();