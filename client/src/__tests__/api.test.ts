import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, getApiUrl } from '../lib/api';

describe('API Utils', () => {
  const originalEnv = { ...import.meta.env };
  
  beforeEach(() => {
    // Reset any mocked environment variables
    vi.stubGlobal('import.meta.env', {
      ...originalEnv
    });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost'
      },
      writable: true
    });
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  describe('getApiBaseUrl', () => {
    const originalWindow = global.window;
    const originalEnv = process.env;
    
    beforeEach(() => {
      // Mock window.location for tests
      delete global.window;
      global.window = Object.create(originalWindow);
      
      // Reset environment variables
      vi.resetModules();
      
      // Mock import.meta.env
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'development',
            VITE_API_URL: undefined
          }
        }
      });
    });
    
    afterEach(() => {
      global.window = originalWindow;
      vi.unstubAllGlobals();
    });
    
    it('should use VITE_API_URL when available', () => {
      import.meta.env.VITE_API_URL = 'https://api.example.com';
      expect(getApiBaseUrl()).toBe('https://api.example.com');
    });
    
    it('should use empty string for production on careerpathfinder.io', () => {
      import.meta.env.MODE = 'production';
      import.meta.env.VITE_API_URL = undefined;
      global.window.location = { hostname: 'careerpathfinder.io' } as Location;
      expect(getApiBaseUrl()).toBe('');
    });
    
    // Also support legacy www subdomain during transition
    it('should use empty string for production on www.careerpathfinder.io (legacy)', () => {
      import.meta.env.MODE = 'production';
      import.meta.env.VITE_API_URL = undefined;
      global.window.location = { hostname: 'www.careerpathfinder.io' } as Location;
      expect(getApiBaseUrl()).toBe('');
    });
    
    it('should use localhost fallback for development', () => {
      import.meta.env.MODE = 'development';
      import.meta.env.VITE_API_URL = undefined;
      expect(getApiBaseUrl()).toBe('http://localhost:3001');
    });
  });
  
  describe('getApiUrl', () => {
    it('should properly combine base URL with endpoint', () => {
      vi.stubGlobal('import.meta.env', {
        ...originalEnv,
        VITE_API_URL: 'https://test-api.example.com'
      });
      
      expect(getApiUrl('/api/test')).toBe('https://test-api.example.com/api/test');
      expect(getApiUrl('api/test')).toBe('https://test-api.example.com/api/test');
    });
    
    it('should handle relative URLs in production', () => {
      vi.stubGlobal('import.meta.env', {
        ...originalEnv,
        MODE: 'production',
        VITE_API_URL: ''
      });
      
      // Mock production domain
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'app.careerpathfinder.io'
        },
        writable: true
      });
      
      expect(getApiUrl('/api/test')).toBe('/api/test');
    });
  });
}); 