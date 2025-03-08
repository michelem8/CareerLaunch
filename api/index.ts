import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import { setupVite, serveStatic } from '../server/vite';
import { storage } from '../server/storage';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Express app
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://careerpathfinder.io',
    'https://www.careerpathfinder.io',
    'https://career-launch.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Simple request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
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

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Setup server
let serverInitialized = false;
async function setupServer() {
  if (serverInitialized) return;
  
  try {
    await initializeDefaultUser();
    
    // Register API routes
    const httpServer = await registerRoutes(app);
    
    // Serve static files in production
    serveStatic(app);
    
    console.log('Server setup complete');
    serverInitialized = true;
  } catch (error) {
    console.error('Failed to setup server:', error);
  }
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize server if not already done
  if (!serverInitialized) {
    await setupServer();
  }

  // Log environment for debugging
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
  console.log('Request path:', req.url);
  
  return new Promise<void>((resolve) => {
    app(req as any, res as any, () => {
      resolve();
    });
  });
} 