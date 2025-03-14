/**
 * API utility functions for managing API URLs across environments
 */

// Get the API base URL from environment or use a fallback
export const getApiBaseUrl = (): string => {
  // First check for environment variable
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Check if we're in production on the main domain
  const isProduction = import.meta.env.MODE === 'production';
  
  // In production environment, use the current domain to avoid CORS issues
  if (isProduction) {
    // Get the current domain (with protocol) to avoid CORS issues between www and non-www
    const currentDomain = window.location.origin;
    return currentDomain;
  }

  // Development fallback
  return 'http://localhost:3001';  // Match the port from .env
};

/**
 * Gets a fully qualified API URL for the given endpoint
 * 
 * @param endpoint - The API endpoint path (with or without leading slash)
 * @returns The full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  
  // Make sure endpoint starts with /api/
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Special case for test endpoints which are now consolidated under utils
  if (normalizedEndpoint === '/api/test' || normalizedEndpoint === '/test') {
    normalizedEndpoint = '/api/utils/test';
  } else if (normalizedEndpoint === '/api/cors-test' || normalizedEndpoint === '/cors-test') {
    normalizedEndpoint = '/api/utils/cors-test';
  } else if (normalizedEndpoint === '/api/openai-status' || normalizedEndpoint === '/openai-status') {
    normalizedEndpoint = '/api/utils/openai-status';
  } else if (!normalizedEndpoint.startsWith('/api/') && !normalizedEndpoint.includes('/api/')) {
    normalizedEndpoint = `/api${normalizedEndpoint}`;
  }
  
  // If we're using a full domain (not empty string), make sure we don't duplicate /api
  if (baseUrl && normalizedEndpoint.startsWith('/api/') && baseUrl.endsWith('/api')) {
    normalizedEndpoint = normalizedEndpoint.substring(4); // Remove the leading /api
  }
  
  return `${baseUrl}${normalizedEndpoint}`;
};

/**
 * Makes an API request with proper headers and error handling
 * 
 * @param endpoint - The API endpoint to call
 * @param options - Fetch options
 * @returns The fetch response
 */
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint);
  console.log(`Making API request to: ${url}`);
  
  try {
    const headers = {
      ...options.headers,
      'Accept': 'application/json',
      'Content-Type': options.method === 'GET' ? 'application/json' : 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });
    
    return response;
  } catch (error) {
    console.error(`API request failed:`, error);
    throw error;
  }
};

// Test function to verify API connectivity
export const testApiConnectivity = async (): Promise<{
  success: boolean;
  error?: string;
  url?: string;
  details?: any;
}> => {
  try {
    const url = getApiUrl('/utils/test'); // Updated to use the consolidated utils endpoint
    console.log(`Testing API connectivity at: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    if (response.ok) {
      // First check the content type to avoid trying to parse HTML as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { 
          success: true,
          url,
          details: data
        };
      } else {
        const text = await response.text();
        const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
        
        return {
          success: false,
          error: isHtml ? 'Received HTML instead of JSON (wrong endpoint)' : 'Invalid content type',
          url,
          details: {
            contentType,
            preview: text.substring(0, 100) + '...',
            isHtml
          }
        };
      }
    } else {
      let errorDetail;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          // Try to parse error details if they exist
          errorDetail = await response.json();
        } catch (e) {
          // If parsing fails, just use the status text
          errorDetail = response.statusText;
        }
      } else {
        // Probably HTML error page
        const text = await response.text();
        errorDetail = text.includes('<!DOCTYPE') ? 
          'Server returned HTML instead of JSON (wrong endpoint)' : 
          text.substring(0, 100);
      }
      
      return { 
        success: false,
        error: `API responded with status: ${response.status}`,
        url,
        details: {
          status: response.status,
          statusText: response.statusText,
          redirected: response.redirected,
          url: response.url,
          contentType,
          errorDetail
        }
      };
    }
  } catch (error) {
    console.error("API connectivity test failed:", error.message);
    return {
      success: false,
      error: error.message,
      url: getApiUrl('/utils/test'),
      details: {
        name: error.name,
        stack: error.stack,
        isCORS: error.message?.includes('CORS')
      }
    };
  }
}; 