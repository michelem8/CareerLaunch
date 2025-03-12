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
    it('should use VITE_API_URL when available', () => {
      vi.stubGlobal('import.meta.env', {
        ...originalEnv,
        VITE_API_URL: 'https://test-api.example.com'
      });
      
      expect(getApiBaseUrl()).toBe('https://test-api.example.com');
    });
    
    it('should return empty string in production on careerpathfinder.io', () => {
      vi.stubGlobal('import.meta.env', {
        ...originalEnv,
        MODE: 'production',
        VITE_API_URL: '' // Empty string to simulate production env file
      });
      
      // Mock production domain
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'app.careerpathfinder.io'
        },
        writable: true
      });
      
      expect(getApiBaseUrl()).toBe('');
    });
    
    it('should return development fallback when not in production', () => {
      vi.stubGlobal('import.meta.env', {
        ...originalEnv,
        MODE: 'development',
        VITE_API_URL: undefined
      });
      
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