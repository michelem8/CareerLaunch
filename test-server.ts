// Load environment variables first
import './server/config/env';
import express from 'express';
import cors from 'cors';
import skillsRoutes from './server/features/skills/routes';

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Mount skills routes
app.use('/api/skills', skillsRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
}); 