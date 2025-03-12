// service worker for CareerLaunch
const CACHE_NAME = 'career-launch-cache-v1';

// Mock data for API fallbacks (only used when offline or explicitly in development mode)
const API_MOCKS = {
  '/api/users/me': {
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
  '/api/survey/roles': {
    id: 1,
    username: "demo_user",
    currentRole: "Product Manager",
    targetRole: "Engineering Manager",
    surveyCompleted: false
  },
  '/api/resume/analyze': {
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
  '/api/survey': {
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
  '/api/survey/complete': {
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
  '/api/courses/recommended': [
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

// Install event - cache essential files
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Helper function to get the API path from a URL
function getApiPath(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (e) {
    console.error('Invalid URL:', url);
    return '';
  }
}

// Check if a URL is an API request
function isApiRequest(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith('/api/');
  } catch (e) {
    return false;
  }
}

// Check if we're in development mode
function isDevelopmentMode() {
  try {
    // Check if hostname is localhost or similar
    const hostname = self.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.includes('.localhost');
  } catch (e) {
    return false;
  }
}

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Only handle API requests
  if (isApiRequest(url)) {
    const apiPath = getApiPath(url);
    
    event.respondWith(
      // First try the network request
      fetch(event.request)
        .then(response => {
          // If we got a valid response, use it
          if (response && response.status === 200) {
            return response;
          }
          
          // If response is not OK, throw to trigger fallback
          throw new Error('Network response was not ok');
        })
        .catch(() => {
          console.log('API request failed, checking if we should use mock data for:', apiPath);
          
          // Only use mock data when offline or in development mode
          const inDevMode = isDevelopmentMode();
          if (inDevMode) {
            console.log('Using mock data in development mode for:', apiPath);
          } else {
            console.log('Network request failed but not using mock data in production for:', apiPath);
            // In production, always return a proper error, never mock data
            return new Response(
              JSON.stringify({ error: 'Network request failed' }),
              { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          
          // Check if we have a mock for this API path
          if (API_MOCKS[apiPath]) {
            // Return mock data in development or when offline
            return new Response(
              JSON.stringify(API_MOCKS[apiPath]),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          
          // Return a generic error if no mock is available
          return new Response(
            JSON.stringify({ error: 'API request failed and no mock available' }),
            { 
              status: 500, 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
  } else {
    // Default behavior for non-API requests
    event.respondWith(
      fetch(event.request)
    );
  }
}); 