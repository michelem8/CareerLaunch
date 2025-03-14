import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getApiBaseUrl, getApiUrl, apiRequest } from '../api';

// Define type for import.meta to fix linter error
declare global {
  interface ImportMeta {
    env: Record<string, any>;
  }
}

// Mock window.location
const mockWindowLocation = (url: string) => {
  // Save original and define new location
  const originalLocation = window.location;
  delete (window as any).location;
  
  window.location = {
    ...originalLocation,
    origin: url,
  } as any;
  
  return () => {
    window.location = originalLocation;
  };
};

// Mock fetch
const mockFetch = (response: any) => {
  const originalFetch = global.fetch;
  
  global.fetch = vi.fn().mockResolvedValue({
    ...response,
    clone: () => response,
    text: () => Promise.resolve(''),
    json: () => Promise.resolve({}),
  });
  
  return () => {
    global.fetch = originalFetch;
  };
};

// Mock import.meta.env
const mockEnv = (env: Record<string, any>) => {
  const originalEnv = { ...import.meta.env };
  
  vi.stubGlobal('import.meta.env', {
    ...originalEnv,
    ...env,
  });
  
  return () => {
    vi.stubGlobal('import.meta.env', originalEnv);
  };
};

describe('API Utilities', () => {
  describe('getApiBaseUrl', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    
    it('should use VITE_API_URL when available', () => {
      // Mock the environment variable
      const restoreEnv = mockEnv({ VITE_API_URL: 'https://api.example.com' });
      
      try {
        expect(getApiBaseUrl()).toBe('https://api.example.com');
      } finally {
        restoreEnv();
      }
    });
    
    it('should use window.location.origin in production when VITE_API_URL is not set', () => {
      // Mock production environment and window.location
      const restoreEnv = mockEnv({ MODE: 'production', VITE_API_URL: undefined });
      const restoreLocation = mockWindowLocation('https://careerlaunch.example.com');
      
      try {
        expect(getApiBaseUrl()).toBe('https://careerlaunch.example.com');
      } finally {
        restoreEnv();
        restoreLocation();
      }
    });
    
    it('should use localhost:3001 in development when VITE_API_URL is not set', () => {
      // Mock development environment
      const restoreEnv = mockEnv({ MODE: 'development', VITE_API_URL: undefined });
      
      try {
        expect(getApiBaseUrl()).toBe('http://localhost:3001');
      } finally {
        restoreEnv();
      }
    });
  });
  
  describe('getApiUrl', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    
    it('should add /api/ prefix if not present', () => {
      const restoreEnv = mockEnv({ MODE: 'development', VITE_API_URL: undefined });
      
      try {
        expect(getApiUrl('test')).toBe('http://localhost:3001/api/test');
        expect(getApiUrl('/test')).toBe('http://localhost:3001/api/test');
      } finally {
        restoreEnv();
      }
    });
    
    it('should maintain /api/ prefix if already present', () => {
      const restoreEnv = mockEnv({ MODE: 'development', VITE_API_URL: undefined });
      
      try {
        expect(getApiUrl('/api/test')).toBe('http://localhost:3001/api/test');
      } finally {
        restoreEnv();
      }
    });
    
    it('should handle utility endpoints in production correctly', () => {
      const restoreEnv = mockEnv({ MODE: 'production', VITE_API_URL: undefined });
      const restoreLocation = mockWindowLocation('https://careerlaunch.example.com');
      
      try {
        // Test all versions of cors-test endpoints
        expect(getApiUrl('/utils/cors-test')).toBe('https://careerlaunch.example.com/api/utils/cors-test');
        expect(getApiUrl('/api/utils/cors-test')).toBe('https://careerlaunch.example.com/api/utils/cors-test');
        expect(getApiUrl('/cors-test')).toBe('https://careerlaunch.example.com/api/cors-test');
        expect(getApiUrl('/api/cors-test')).toBe('https://careerlaunch.example.com/api/cors-test');
      } finally {
        restoreEnv();
        restoreLocation();
      }
    });
    
    it('should avoid double slashes if baseUrl ends with a slash', () => {
      const restoreEnv = mockEnv({ VITE_API_URL: 'https://api.example.com/' });
      
      try {
        expect(getApiUrl('/api/test')).toBe('https://api.example.com/api/test');
      } finally {
        restoreEnv();
      }
    });
  });
  
  describe('apiRequest', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    
    it('should make a fetch request with proper headers', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
      };
      
      const restoreFetch = mockFetch(mockResponse);
      
      try {
        await apiRequest('/test');
        
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors',
        });
      } finally {
        restoreFetch();
      }
    });
    
    it('should handle HTML responses correctly', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockResponse = {
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('text/html'),
        },
      };
      
      const restoreFetch = mockFetch(mockResponse);
      
      try {
        await apiRequest('/test');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'API request returned HTML instead of JSON:',
          expect.any(Object)
        );
      } finally {
        restoreFetch();
        consoleErrorSpy.mockRestore();
      }
    });
  });
}); 