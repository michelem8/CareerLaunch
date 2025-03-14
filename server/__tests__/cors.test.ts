import request from 'supertest';
import express from 'express';
import { redirectMiddleware } from '../middleware';
import { serveStatic } from '../vite';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

// Mock fs.existsSync and fs.readdirSync
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue([]),
  promises: {
    readFile: jest.fn().mockResolvedValue('<!DOCTYPE html><html><head></head><body></body></html>')
  }
}));

// Mock path.resolve
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  resolve: jest.fn().mockReturnValue('/mock/path'),
  join: jest.fn().mockReturnValue('/mock/path/index.html')
}));

describe('CORS Middleware Tests', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Reset environment
    process.env.NODE_ENV = 'production';
    
    // Create a new Express app for each test
    app = express();
    
    // Add CORS middleware
    app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'https://www.careerpathfinder.io'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true
    }));
    
    // Add redirect middleware
    app.use(redirectMiddleware);
    
    // Add a test endpoint
    app.get('/test', (req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Add static file serving
    app.use(express.static('/mock/path'));
    
    // Add catch-all route
    app.get('*', (req, res) => {
      res.sendFile('/mock/path/index.html');
    });
  });
  
  test('Should set CORS headers for requests from primary domain', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'https://www.careerpathfinder.io');
    
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://www.careerpathfinder.io');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
  
  test('Should support legacy non-www domain during transition period', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'https://careerpathfinder.io');
    
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
  
  test('Should redirect from non-www to www domain with CORS headers', async () => {
    const response = await request(app)
      .get('/test')
      .set('Host', 'careerpathfinder.io')
      .set('Origin', 'https://careerpathfinder.io');
    
    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('https://www.careerpathfinder.io/test');
    expect(response.headers['access-control-allow-origin']).toBe('https://careerpathfinder.io');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
  
  test('Should handle OPTIONS preflight requests correctly', async () => {
    const response = await request(app)
      .options('/test')
      .set('Origin', 'https://www.careerpathfinder.io')
      .set('Access-Control-Request-Method', 'GET');
    
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://www.careerpathfinder.io');
    expect(response.headers['access-control-allow-methods']).toBeTruthy();
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
}); 