/// <reference types="vite/client" />
import { QueryClient, type QueryFunction } from "@tanstack/react-query";

// Define the API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log('API Base URL:', API_BASE_URL);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = async (method: string, path: string, body?: unknown) => {
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log(`Making ${method} request to:`, fullUrl);
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      // Adding mode to help with CORS issues
      mode: 'cors',
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
      const res = await fetch(fullUrl, {
        credentials: "include",
        mode: 'cors', // Adding mode to help with CORS issues
      });

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
