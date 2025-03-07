import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import cors from 'cors';
import session from 'express-session';
import MemoryStore from 'memorystore';

const app = express();
const MemoryStoreSession = MemoryStore(session);

// Middleware
app.use(express.json());
app.use(cors());
app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  resave: false,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  saveUninitialized: false,
}));

// Apply routes
await registerRoutes(app);

// Create server handler
const server = createServer(app);

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Forward the request to Express
  return new Promise((resolve, reject) => {
    app(req, res, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve(undefined);
    });
  });
} 