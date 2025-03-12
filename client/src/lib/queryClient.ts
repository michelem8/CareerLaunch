/// <reference types="vite/client" />
import { QueryClient, type QueryFunction } from "@tanstack/react-query";

// Define the API base URL - ensure it includes the www subdomain in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'SSR');

// MOCK DATA for development mode only
const MOCK_DATA = import.meta.env.MODE === 'development' ? {
  "/api/users/me": {
    id: 1,
    username: "demo_user",
    currentRole: "Product Manager",
    targetRole: "Engineering Manager",
    skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
    surveyCompleted: true,
    hasCompletedSurvey: true,
    resumeAnalysis: {
      skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
      experience: [
        "Senior Product Manager at Tech Company (2018-2023)",
        "Product Manager at Software Inc (2015-2018)"
      ],
      education: [
        "MBA, Business School (2015)",
        "BS Computer Science, University (2012)"
      ],
      missingSkills: [
        "Engineering Leadership",
        "Team Building", 
        "Technical Architecture",
        "Cross-functional Communication"
      ],
      recommendations: [
        "Focus on team building and leadership skills",
        "Develop deeper technical architecture knowledge",
        "Practice making technical decisions at scale"
      ],
      suggestedRoles: ["Technical Product Manager", "Engineering Manager", "Development Team Lead"]
    },
    preferences: {
      preferredIndustries: ["enterprise-software", "ai-ml"],
      learningStyles: ["practical", "self-paced"],
      timeCommitment: "4-8"
    }
  },
  "/api/survey/roles": (data: any) => ({
    id: 1,
    username: "demo_user",
    currentRole: data?.currentRole || "Product Manager",
    targetRole: data?.targetRole || "Engineering Manager",
    surveyCompleted: false
  }),
  "/api/resume/analyze": {
    user: {
      id: 1,
      username: "demo_user",
      resumeAnalysis: {
        skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
        experience: [
          "Senior Product Manager at Tech Company (2018-2023)",
          "Product Manager at Software Inc (2015-2018)"
        ],
        education: [
          "MBA, Business School (2015)",
          "BS Computer Science, University (2012)"
        ],
        missingSkills: [
          "Engineering Leadership",
          "Team Building", 
          "Technical Architecture",
          "Cross-functional Communication"
        ],
        recommendations: [
          "Focus on team building and leadership skills",
          "Develop deeper technical architecture knowledge",
          "Practice making technical decisions at scale"
        ]
      }
    },
    skillGap: {
      missingSkills: [
        "Engineering Leadership",
        "Team Building", 
        "Technical Architecture",
        "Cross-functional Communication"
      ],
      recommendations: [
        "Focus on team building and leadership skills",
        "Develop deeper technical architecture knowledge",
        "Practice making technical decisions at scale"
      ]
    }
  },
  "/api/survey": (data: any) => ({
    id: 1,
    username: "demo_user",
    currentRole: data?.currentRole || "Product Manager",
    targetRole: data?.targetRole || "Engineering Manager",
    surveyCompleted: true,
    preferences: data?.preferences || {
      preferredIndustries: ["enterprise-software", "ai-ml"],
      learningStyles: ["practical", "self-paced"],
      timeCommitment: "4-8"
    }
  }),
  "/api/survey/complete": {
    id: 1,
    username: "demo_user",
    currentRole: "Product Manager",
    targetRole: "Engineering Manager",
    surveyCompleted: true,
    preferences: {
      preferredIndustries: ["enterprise-software", "ai-ml"],
      learningStyles: ["practical", "self-paced"],
      timeCommitment: "4-8"
    }
  },
  "/api/courses/recommended": [
    {
      id: 1,
      title: "Engineering Leadership Fundamentals",
      description: "Learn the core principles of leading engineering teams effectively",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      skills: ["Engineering Leadership", "Team Management", "Technical Decision Making"],
      difficulty: "intermediate",
      industry: "enterprise-software",
      learningStyle: "practical",
      timeCommitment: "4-8",
      level: "intermediate"
    },
    {
      id: 2,
      title: "Technical Architecture for Managers",
      description: "Bridge the gap between management and technical architecture",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
      skills: ["Technical Architecture", "System Design", "Architecture Planning"],
      difficulty: "advanced",
      industry: "enterprise-software",
      learningStyle: "project_based",
      timeCommitment: "4-8",
      level: "advanced"
    },
    {
      id: 3,
      title: "Cross-functional Communication",
      description: "Effectively communicate across engineering and product teams",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
      skills: ["Cross-functional Communication", "Leadership", "Team Collaboration"],
      difficulty: "intermediate",
      industry: "product-management",
      learningStyle: "interactive",
      timeCommitment: "2-4",
      level: "intermediate"
    }
  ]
} : {};

// Function to get mock data for a path
const getMockData = (path: string, body?: any): any => {
  // Only use mock data in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }
  
  console.log(`Using mock data for ${path} in development mode`);
  const mockData = MOCK_DATA[path as keyof typeof MOCK_DATA];
  
  // If the mock data is a function, call it with the body
  if (typeof mockData === 'function') {
    return mockData(body);
  }
  
  return mockData;
};

// Add a custom fetch function with built-in CORS support
export const corsFixFetch = async (url: string, options: RequestInit = {}) => {
  // Check if URL is already absolute
  const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
  
  // Ensure we have the right headers
  const headers = {
    ...(options.headers || {}),
    'Content-Type': options.method === 'GET' ? undefined : 'application/json',
    'Accept': 'application/json',
  };

  // Log the request for debugging
  console.log(`Making request to: ${url}`);
  console.log(`Using headers:`, headers);

  try {
    // Directly use the configured API URL to avoid redirects
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
      redirect: 'error'  // Don't follow redirects as they can cause CORS issues
    });
    
    // Check if the response needs handling
    if (response.status === 0) {
      // This is a special case that might indicate a CORS error
      throw new Error('Zero status response, likely a CORS error');
    }
    
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    
    // If we detect a redirect issue, try again with redirect: follow
    if (error.message && (
        error.message.includes('redirect') || 
        error.message.includes('Redirect')
      )) {
      console.log('Detected redirect issue, retrying with redirect: follow');
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
          mode: 'cors',
          redirect: 'follow'
        });
        return response;
      } catch (retryError) {
        console.error(`Retry fetch error for ${url}:`, retryError);
        throw retryError;
      }
    }
    
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
  // Always use the full API URL with the www subdomain when available
  const fullUrl = path.startsWith('http') 
    ? path  // If path is already a full URL, use it as is
    : path.startsWith('/') 
      ? `${API_BASE_URL}${path}`  // If path starts with /, append to base URL
      : `${API_BASE_URL}/${path}`; // Otherwise, ensure / between base URL and path
  
  console.log(`Making ${method} request to:`, fullUrl);
  
  try {
    const response = await corsFixFetch(fullUrl, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Log response details for debugging
    console.log(`Response status: ${response.status}`);
    
    return response;
  } catch (error) {
    console.error(`API request failed:`, error);
    
    // Check if this is a CORS error or network error
    if (error instanceof TypeError && 
       (error.message.includes('Failed to fetch') || 
        error.message.includes('Network request failed'))) {
      
      console.error('This may be a CORS or network issue. Check that the server allows requests from this origin.');
      console.error('Current origin:', window.location.origin);
      console.error('Target URL:', fullUrl);
      
      // Only use mock data in development mode
      if (import.meta.env.MODE === 'development') {
        const mockData = getMockData(path, body);
        if (mockData) {
          console.log('Using mock data fallback in development mode');
          const mockResponse = new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
          return mockResponse;
        }
      }
      
      // In production, throw the error to be handled by the calling code
      console.error('In production environment - not using mock data.');
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
    // Always use the full API URL with www subdomain when available
    const fullUrl = url.startsWith('http')
      ? url  // If URL is already absolute, use it as is
      : url.startsWith('/') 
        ? `${API_BASE_URL}${url}`  // If URL starts with /, append to base URL
        : `${API_BASE_URL}/${url}`; // Otherwise, ensure / between base URL and path
      
    console.log("Making query to:", fullUrl);
    
    try {
      const res = await corsFixFetch(fullUrl);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Check if this is a CORS error
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
        
        // Return mock data as a fallback
        const mockData = getMockData(url);
        if (mockData) {
          console.log('Using mock data fallback for query');
          return mockData;
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
