import request from 'supertest';
import express, { type Express, Request, Response } from 'express';
import { registerRoutes } from '../routes';
import { corsMiddleware, redirectMiddleware, preflightRedirectMiddleware } from '../middleware';

describe('API Routes Tests', () => {
  let app: Express;
  let server: any;

  beforeAll(async () => {
    // Create a test Express application
    app = express();
    
    // Mark API requests
    app.use((req, res, next) => {
      if (req.originalUrl.startsWith('/api/') || 
          req.path.startsWith('/api/') || 
          req.url.startsWith('/api/') ||
          req.originalUrl.includes('/api/') ||
          req.path === '/test' ||
          req.path === '/cors-test' ||
          req.path === '/api/test' ||
          req.path === '/api/cors-test' ||
          req.path.includes('/survey/')) {
        req.isApiRequest = true;
        res.setHeader('Content-Type', 'application/json');
      }
      next();
    });
    
    // Apply middleware in the same order as the main app
    app.use(corsMiddleware);
    app.use(preflightRedirectMiddleware);
    
    // Parse JSON
    app.use(express.json());
    
    // Register the API routes
    server = await registerRoutes(app);
    
    // Add a catch-all route that simulates returning HTML (like in production)
    app.use((req, res, next) => {
      // Skip for API routes
      if (req.isApiRequest) {
        return next();
      }
      
      // Return mock HTML for non-API routes
      res.setHeader('Content-Type', 'text/html');
      res.send(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Test HTML</title>
        </head>
        <body>
          <h1>This is HTML</h1>
        </body>
      </html>`);
    });
  });

  afterAll(() => {
    if (server && server.close) {
      server.close();
    }
  });

  test('should return JSON for /api/utils/cors-test', async () => {
    const response = await request(app)
      .get('/api/utils/cors-test')
      .set('Origin', 'https://www.careerpathfinder.io');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('success', true);
  });

  test('should return JSON for /api/cors-test', async () => {
    const response = await request(app)
      .get('/api/cors-test')
      .set('Origin', 'https://www.careerpathfinder.io');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('success', true);
  });

  test('should properly handle preflight requests to API endpoints', async () => {
    const response = await request(app)
      .options('/api/utils/cors-test')
      .set('Origin', 'https://www.careerpathfinder.io')
      .set('Access-Control-Request-Method', 'GET');
    
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://www.careerpathfinder.io');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
}); 