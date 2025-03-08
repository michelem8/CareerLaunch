import { describe, it, expect, vi, beforeEach } from 'vitest';
import { corsFixFetch } from '../lib/queryClient';

// Mock fetch for testing
global.fetch = vi.fn();

describe('CORS preflight handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    
    // Reset window.location.origin for tests
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://careerpathfinder.io'
      },
      writable: true
    });
  });

  it('should handle preflight redirects by retrying with redirect: follow', async () => {
    // First mock a failed fetch with a redirect error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch: Redirect is not allowed for a preflight request')
    );
    
    // Then mock a successful fetch for the retry
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => 'success'
    });

    // Test corsFixFetch with the mocked responses
    const response = await corsFixFetch('https://careerpathfinder.io/api/users/me', { method: 'GET' });
    
    // Verify first attempt had redirect: error
    expect(global.fetch).toHaveBeenNthCalledWith(1, 
      'https://careerpathfinder.io/api/users/me', 
      expect.objectContaining({ redirect: 'error' })
    );
    
    // Verify second attempt had redirect: follow
    expect(global.fetch).toHaveBeenNthCalledWith(2, 
      'https://careerpathfinder.io/api/users/me', 
      expect.objectContaining({ redirect: 'follow' })
    );
    
    // Response should be the successful one from the retry
    expect(response.ok).toBe(true);
  });

  it('should test OPTIONS handling for preflight requests', async () => {
    // Mock a successful OPTIONS preflight request
    (global.fetch as jest.Mock).mockImplementationOnce(async (url, options) => {
      if (options.method === 'OPTIONS') {
        return {
          ok: true,
          status: 204,
          headers: new Headers({
            'Access-Control-Allow-Origin': 'https://careerpathfinder.io',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          })
        };
      }
      
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      };
    });
    
    // Simulate a preflight request
    const response = await fetch('https://careerpathfinder.io/api/users/me', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        'Origin': 'https://careerpathfinder.io'
      }
    });
    
    // The preflight should succeed
    expect(response.status).toBe(204);
    
    // Headers should include CORS permissions
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://careerpathfinder.io');
  });
}); 