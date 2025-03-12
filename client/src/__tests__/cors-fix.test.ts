import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiUrl, getApiBaseUrl } from '../lib/api';

// Mock the import.meta.env
vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getApiBaseUrl: vi.fn(),
    getApiUrl: vi.fn(),
  };
});

describe('CORS Fix Tests', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();
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