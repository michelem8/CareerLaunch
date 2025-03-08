/// <reference types="vite/client" />
import { QueryClient, type QueryFunction } from "@tanstack/react-query";

// Define the API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

// Add a custom fetch function with built-in CORS support
export const corsFixFetch = async (url: string, options: RequestInit = {}) => {
  // Ensure we have the right headers
  const headers = {
    ...(options.headers || {}),
    'Content-Type': options.method === 'GET' ? undefined : 'application/json',
    'Accept': 'application/json',
  };

  // Try the normal fetch first
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors'
    });
    
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = async (method: string, path: string, body?: unknown) => {
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log(`Making ${method} request to:`, fullUrl);
  
  try {
    const response = await corsFixFetch(fullUrl, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Log response details for debugging
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries([...response.headers]));
    
    return response;
  } catch (error) {
    console.error(`API request failed:`, error);
    // Add additional context for CORS errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('This may be a CORS issue. Check that the server allows requests from this origin.');
      console.error('Current origin:', window.location.origin);
      console.error('Target URL:', `${API_BASE_URL}${path}`);
    }
    throw error;
  }
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log("Making query to:", fullUrl);
    
    try {
      const res = await corsFixFetch(fullUrl);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Add additional context for CORS errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('This may be a CORS issue. Check that the server allows requests from this origin.');
        console.error('Current origin:', window.location.origin);
        console.error('Target URL:', fullUrl);
        
        // Try to check the CORS test endpoint to diagnose the issue
        try {
          const corsTestUrl = `${API_BASE_URL}/api/cors-test`;
          console.log('Testing CORS with endpoint:', corsTestUrl);
          const testResponse = await fetch(corsTestUrl, { 
            mode: 'cors', 
            credentials: 'include' 
          });
          const testResult = await testResponse.text();
          console.log('CORS test result:', testResult);
        } catch (corsTestError) {
          console.error('CORS test failed:', corsTestError);
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
