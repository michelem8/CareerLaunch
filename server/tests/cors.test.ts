import request from 'supertest';
import express, { Request, Response } from 'express';
import { redirectMiddleware, corsMiddleware, staticAssetsCorsMiddleware } from '../middleware';

describe('CORS and Redirect Middleware Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use('/', redirectMiddleware);
    app.use('/', corsMiddleware);
    app.use('/', staticAssetsCorsMiddleware);
    
    // Add test routes
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true });
    });
    
    app.get('/assets/test.js', (req: Request, res: Response) => {
      res.send('console.log("test");');
    });
    
    app.get('/favicon.ico', (req: Request, res: Response) => {
      res.send('favicon');
    });
  });

  test('should redirect from www to non-www domain', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Host', 'www.careerpathfinder.io')
      .set('Origin', 'https://www.careerpathfinder.io');
    
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('https://careerpathfinder.io/api/test');
  });

  test('should set CORS headers for non-www domain', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Host', 'careerpathfinder.io')
      .set('Origin', 'https://careerpathfinder.io');
    
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  test('should handle OPTIONS preflight requests correctly', async () => {
    const res = await request(app)
      .options('/api/test')
      .set('Host', 'careerpathfinder.io')
      .set('Origin', 'https://careerpathfinder.io')
      .set('Access-Control-Request-Method', 'GET');
    
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-allow-methods']).toContain('GET');
  });

  test('should set CORS headers for static assets', async () => {
    const res = await request(app)
      .get('/assets/test.js')
      .set('Host', 'careerpathfinder.io')
      .set('Origin', 'https://careerpathfinder.io');
    
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  test('should set CORS headers for favicon.ico', async () => {
    const res = await request(app)
      .get('/favicon.ico')
      .set('Host', 'careerpathfinder.io')
      .set('Origin', 'https://careerpathfinder.io');
    
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  test('should allow cross-origin requests during transition period', async () => {
    const res = await request(app)
      .get('/assets/test.js')
      .set('Host', 'careerpathfinder.io')
      .set('Origin', 'https://www.careerpathfinder.io');
    
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://www.careerpathfinder.io');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
}); 