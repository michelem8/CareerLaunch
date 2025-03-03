// Load environment variables first
import { config } from 'dotenv';
config();

// Now import the rest
import express from 'express';
import cors from 'cors';
import skillsRoutes from './server/features/skills/routes';

// Validate environment variables
if (!process.env.RAPID_API_KEY) {
  console.error('Error: RAPID_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('RAPID_API_KEY is set:', !!process.env.RAPID_API_KEY);
console.log('RAPID_API_KEY length:', process.env.RAPID_API_KEY?.length);
console.log('RAPID_API_HOST is set:', !!process.env.RAPID_API_HOST);

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Mount skills routes
app.use('/api/skills', skillsRoutes);

// Start server
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
}); 