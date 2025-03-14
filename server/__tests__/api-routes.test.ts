import request from 'supertest';
import express from 'express';
import { setupVite, serveStatic } from '../vite';
import { registerRoutes } from '../routes';
import { corsMiddleware, preflightRedirectMiddleware, redirectMiddleware } from '../middleware';
import path from 'path';
import http from 'http';

describe('API Routes', () => {
  let app: express.Express;
  let server: http.Server;
  let originalNodeEnv: string | undefined;

  beforeAll(async () => {
    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    
    // Create a new Express app
    app = express();
    
    // Add API detection middleware
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
    
    // Add CORS middleware
    app.use(corsMiddleware);
    app.use(preflightRedirectMiddleware);
    
    // Setup JSON parsing
    app.use(express.json());
    
    // Register API routes
    server = await registerRoutes(app);
    
    // Add redirect middleware (for production only)
    app.use((req, res, next) => {
      if (req.isApiRequest || 
          req.originalUrl.startsWith('/api/') || 
          req.path.startsWith('/api/') ||
          req.url.startsWith('/api/') ||
          req.originalUrl.includes('/api/') ||
          req.path === '/test' ||
          req.path === '/cors-test' ||
          req.path === '/api/test' ||
          req.path === '/api/cors-test' ||
          req.path.includes('/survey/')) {
        return next();
      }
      redirectMiddleware(req, res, next);
    });
    
    // In these tests, we'll simulate both development and production environments
  });
  
  afterAll(async () => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });
  
  describe('Development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });
    
    test('GET /api/test should return JSON, not HTML', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      // Verify it's not HTML
      expect(response.text).not.toContain('<!DOCTYPE html>');
      expect(response.text).not.toContain('<html>');
    });
    
    test('GET /test should return JSON, not HTML', async () => {
      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      // Verify it's not HTML
      expect(response.text).not.toContain('<!DOCTYPE html>');
      expect(response.text).not.toContain('<html>');
    });
    
    test('GET /api/survey/roles should return JSON, not HTML', async () => {
      // This is mocking a GET to this endpoint, which might not exist
      // but we want to ensure it doesn't return HTML
      const response = await request(app).get('/api/survey/roles');
      
      // It might return 404, but should never return HTML
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.text).not.toContain('<!DOCTYPE html>');
      expect(response.text).not.toContain('<html>');
    });
  });
  
  describe('Production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });
    
    test('GET /api/test should return JSON, not HTML in production', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      // Verify it's not HTML
      expect(response.text).not.toContain('<!DOCTYPE html>');
      expect(response.text).not.toContain('<html>');
    });
    
    test('GET /test should return JSON, not HTML in production', async () => {
      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      // Verify it's not HTML
      expect(response.text).not.toContain('<!DOCTYPE html>');
      expect(response.text).not.toContain('<html>');
    });
    
    test('OPTIONS requests to API endpoints should handle CORS correctly', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'https://careerpathfinder.io')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });
  });
}); 