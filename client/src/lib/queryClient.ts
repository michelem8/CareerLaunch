/// <reference types="vite/client" />
import { QueryClient, type QueryFunction } from "@tanstack/react-query";

// Define the API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

// MOCK DATA for fallbacks when API calls fail
const MOCK_DATA = {
  "/api/users/me": {
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
};

// Function to get mock data for a path
const getMockData = (path: string, body?: any): any => {
  console.log(`Using mock data for ${path}`);
  const mockData = MOCK_DATA[path as keyof typeof MOCK_DATA];
  
  // If the mock data is a function, call it with the body
  if (typeof mockData === 'function') {
    return mockData(body);
  }
  
  return mockData;
};

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
    
    // Check if this is a CORS error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('This may be a CORS issue. Check that the server allows requests from this origin.');
      console.error('Current origin:', window.location.origin);
      console.error('Target URL:', `${API_BASE_URL}${path}`);
      
      // Create a mock response using the fallback data
      const mockData = getMockData(path, body);
      if (mockData) {
        console.log('Using mock data fallback');
        const mockResponse = new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        return mockResponse;
      }
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
