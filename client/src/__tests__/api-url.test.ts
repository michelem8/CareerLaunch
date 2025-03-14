import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, getApiUrl } from '../lib/api';

describe('API URL Construction', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://careerpathfinder.io',
        hostname: 'careerpathfinder.io'
      },
      writable: true
    });
    
    // Mock import.meta.env
    vi.stubGlobal('import.meta', {
      env: {
        MODE: 'production',
        VITE_API_URL: undefined
      }
    });
    
    // Spy on console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  
  it('should use window.location.origin in production', () => {
    const baseUrl = getApiBaseUrl();
    expect(baseUrl).toBe('https://careerpathfinder.io');
  });
  
  it('should respect VITE_API_URL if provided', () => {
    vi.stubGlobal('import.meta', {
      env: {
        MODE: 'production',
        VITE_API_URL: 'https://api.example.com'
      }
    });
    
    const baseUrl = getApiBaseUrl();
    expect(baseUrl).toBe('https://api.example.com');
  });
  
  it('should properly format utility endpoints', () => {
    // Test the CORS test endpoint specifically
    const corsTestUrl = getApiUrl('/utils/cors-test');
    expect(corsTestUrl).toBe('https://careerpathfinder.io/api/utils/cors-test');
    
    // Test with the /api prefix already included
    const apiCorsTestUrl = getApiUrl('/api/utils/cors-test');
    expect(apiCorsTestUrl).toBe('https://careerpathfinder.io/api/utils/cors-test');
  });
  
  it('should log extra debugging for utility endpoints', () => {
    getApiUrl('/utils/cors-test');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('special endpoint'));
  });
}); 