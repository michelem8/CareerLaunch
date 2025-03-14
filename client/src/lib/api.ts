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

  // In production environment, use the deployed API URL
  if (import.meta.env.MODE === 'production') {
    // Return the absolute production API URL instead of relative path
    // This ensures we hit the actual API server instead of the frontend host
    return 'https://api.careerpathfinder.io';
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
  
  // Normalize endpoint to always have a leading slash
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Ensure all API endpoints have the /api/ prefix
  if (!normalizedEndpoint.startsWith('/api/')) {
    // Always add /api/ prefix to endpoints that don't have it
    normalizedEndpoint = `/api${normalizedEndpoint}`;
  }
  
  // Super simple URL construction - just join the parts
  // Avoid double slashes if baseUrl ends with a slash
  const url = baseUrl.endsWith('/') 
    ? `${baseUrl}${normalizedEndpoint.substring(1)}`
    : `${baseUrl}${normalizedEndpoint}`;
  
  console.log(`API URL: ${url}`);
  return url;
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
    
    // Check for HTML response (likely a routing issue)
    if (!response.headers.get('content-type')?.includes('application/json')) {
      // Peek at the content to see if it's HTML
      const clone = response.clone();
      const text = await clone.text();
      
      // Log error if it looks like HTML was returned
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('API request returned HTML instead of JSON:', {
          url,
          status: response.status,
          preview: text.substring(0, 100) + '...'
        });
      }
    }
    
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
    // Try multiple test endpoints in sequence
    const testEndpoints = [
      '/api/test',
      '/api/utils/test',
      '/api/diagnostics',
      '/api/health'
    ];
    
    // Add warning about the test
    console.log('Testing API connectivity with multiple endpoints:', testEndpoints);
    console.log('Current environment:', import.meta.env.MODE);
    console.log('API base URL:', getApiBaseUrl());
    
    // Try each endpoint until one works
    for (const testPath of testEndpoints) {
      try {
        const url = getApiUrl(testPath);
        console.log(`Trying endpoint: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });

        // Successful response - parse and return
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`Successful connection to ${testPath}:`, data);
            return { 
              success: true,
              url,
              details: {
                ...data,
                endpoint: testPath,
                contentType
              }
            };
          }
        }
        
        // If we got here, either response wasn't OK or content type wasn't JSON
        console.log(`Endpoint ${testPath} failed:`, {
          status: response.status,
          contentType: response.headers.get('content-type')
        });
      } catch (endpointError) {
        console.error(`Error with endpoint ${testPath}:`, endpointError.message);
        // Continue to next endpoint
      }
    }
    
    // If we get here, all endpoints failed
    throw new Error("All API test endpoints failed");
    
  } catch (error) {
    console.error("API connectivity test failed:", error.message);
    return {
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack,
        isCORS: error.message?.includes('CORS'),
        environment: import.meta.env.MODE,
        apiBaseUrl: getApiBaseUrl()
      }
    };
  }
}; 