import request from 'supertest';
import express, { type Express, Request, Response } from 'express';
import { corsMiddleware } from '../middleware';

describe('CORS Utils Endpoints Tests', () => {
  let app: Express;
  
  beforeEach(() => {
    app = express();
    
    // Add the corsMiddleware
    app.use(corsMiddleware);
    
    // Add a mock /api/utils/cors-test endpoint
    app.get('/api/utils/cors-test', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'CORS test successful',
        path: req.path,
        isApiRequest: (req as any).isApiRequest
      });
    });
    
    // Add a catch-all route that returns HTML (simulating the production environment issue)
    app.use((req: Request, res: Response) => {
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
  
  test('should handle GET to /api/utils/cors-test with proper JSON response', async () => {
    const response = await request(app)
      .get('/api/utils/cors-test')
      .set('Origin', 'https://www.careerpathfinder.io');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('isApiRequest', true);
  });
  
  test('should handle OPTIONS to /api/utils/cors-test with proper CORS headers', async () => {
    const response = await request(app)
      .options('/api/utils/cors-test')
      .set('Origin', 'https://www.careerpathfinder.io')
      .set('Access-Control-Request-Method', 'GET');
    
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://www.careerpathfinder.io');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    expect(response.headers['access-control-allow-methods']).toBeTruthy();
  });
}); 