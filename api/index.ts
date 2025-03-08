import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';
import { storage } from '../server/storage';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Express app
const app = express();

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

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Initialize server
let isInitialized = false;
async function initServer() {
  if (isInitialized) return;
  
  try {
    // Initialize storage and default user
    try {
      const defaultUser = await storage.createUser({
        username: "demo_user",
        password: "demo_password"
      });
      console.log("Default user initialized");
    } catch (error) {
      console.error("Error initializing default user:", error);
    }
    
    // Register API routes
    await registerRoutes(app);
    
    isInitialized = true;
    console.log("Server initialized successfully");
  } catch (error) {
    console.error("Server initialization error:", error);
  }
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize server on first request
  if (!isInitialized) {
    console.log("Initializing server...");
    await initServer();
  }
  
  // Debug logging
  console.log(`Handling ${req.method} request to ${req.url}`);
  
  // Process the request
  return new Promise<void>((resolve) => {
    app(req as any, res as any, () => {
      resolve();
    });
  });
} 