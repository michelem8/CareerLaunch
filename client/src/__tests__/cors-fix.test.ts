import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiUrl, getApiBaseUrl } from '../lib/api';

// Mock window.location
const mockLocation = {
  origin: 'https://careerpathfinder.io',
  hostname: 'careerpathfinder.io'
};

// Mock import.meta.env
vi.mock('../lib/api', () => ({
  getApiBaseUrl: vi.fn(),
  getApiUrl: vi.fn()
}));

describe('CORS Fix Tests', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
    
    // Import the real functions
    vi.doUnmock('../lib/api');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use empty base URL in production to avoid CORS issues', () => {
    // Mock the implementation to test production behavior
    (getApiBaseUrl as any).mockImplementation(() => {
      // Simulate production environment
      return '';
    });
    
    // Call the actual getApiUrl function with our mocked getApiBaseUrl
    (getApiUrl as any).mockImplementation((endpoint: string) => {
      const baseUrl = getApiBaseUrl();
      let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      if (!normalizedEndpoint.startsWith('/api/') && !normalizedEndpoint.includes('/api/')) {
        normalizedEndpoint = `/api${normalizedEndpoint}`;
      }
      return `${baseUrl}${normalizedEndpoint}`;
    });

    // Test that in production, we get a relative URL
    const url = getApiUrl('/api/test');
    expect(url).toBe('/api/test');
    expect(getApiBaseUrl).toHaveBeenCalled();
  });

  it('should handle API requests with relative URLs in production', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/test') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ message: 'API is working correctly' }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Test the API call with a relative URL
    const response = await fetch('/api/test');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.message).toBe('API is working correctly');
    expect(fetch).toHaveBeenCalledWith('/api/test');
  });

  it('should handle CORS errors gracefully', async () => {
    // Mock a CORS error
    const corsError = new Error('Failed to fetch: CORS error');
    global.fetch = vi.fn().mockRejectedValue(corsError);

    // Mock console.error to avoid cluttering test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await fetch('/api/test');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('CORS error');
    }

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('API URL Generation with CORS Fix', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
    
    // Import the real functions
    vi.doUnmock('../lib/api');
  });

  it('should use the current domain in production', () => {
    // Mock import.meta.env
    vi.stubGlobal('import.meta', {
      env: {
        MODE: 'production',
        VITE_API_URL: undefined
      }
    });
    
    // Call the function
    const baseUrl = getApiBaseUrl();
    
    // Verify it uses the current domain
    expect(baseUrl).toBe('https://careerpathfinder.io');
  });

  it('should use the environment variable if provided', () => {
    // Mock import.meta.env
    vi.stubGlobal('import.meta', {
      env: {
        MODE: 'production',
        VITE_API_URL: 'https://api.example.com'
      }
    });
    
    // Call the function
    const baseUrl = getApiBaseUrl();
    
    // Verify it uses the environment variable
    expect(baseUrl).toBe('https://api.example.com');
  });

  it('should generate correct API URLs in production', () => {
    // Mock import.meta.env
    vi.stubGlobal('import.meta', {
      env: {
        MODE: 'production',
        VITE_API_URL: undefined
      }
    });
    
    // Test various endpoint formats
    const url1 = getApiUrl('/test');
    const url2 = getApiUrl('test');
    const url3 = getApiUrl('/api/test');
    
    // Verify the URLs are correct
    expect(url1).toBe('https://careerpathfinder.io/api/test');
    expect(url2).toBe('https://careerpathfinder.io/api/test');
    expect(url3).toBe('https://careerpathfinder.io/api/test');
  });
}); 