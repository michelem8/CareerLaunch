import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SurveySteps } from "@/components/survey-steps";
import { ResumeUpload } from "@/components/resume-upload";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";
import { getApiUrl, testApiConnectivity, getApiBaseUrl } from '@/lib/api';

// Enhanced CORS testing function with better diagnostics
const testCors = async () => {
  console.log('Testing CORS functionality...');

  // Result object to track test outcomes
  interface TestResult {
    success: boolean;
    status?: number;
    statusText?: string;
    data?: any;
    error?: string;
    details?: any;
  }

  interface TestResults {
    corsTest?: TestResult;
    headersTest?: TestResult;
    userTest?: TestResult;
    overallError?: string;
    browserInfo?: {
      userAgent: string;
      origin: string;
      environment: string;
      apiBaseUrl: string
    };
  }

  const results: TestResults = {
    browserInfo: {
      userAgent: navigator.userAgent,
      origin: window.location.origin,
      environment: import.meta.env.MODE,
      apiBaseUrl: getApiBaseUrl()
    }
  };

  // Log environment information for debugging
  console.log('Environment:', import.meta.env.MODE);
  console.log('API Base URL:', getApiBaseUrl());
  console.log('Origin:', window.location.origin);

  // Test the API connectivity first
  const apiConnectivity = await testApiConnectivity();
  if (!apiConnectivity.success) {
    console.error('API connectivity test failed:', apiConnectivity.error);
    return {
      ...results,
      overallError: `API connectivity test failed: ${apiConnectivity.error} - URL: ${apiConnectivity.url}`
    };
  }
  
  // Try multiple CORS test endpoints - focus on /api/ prefixed endpoints first
  const corsEndpoints = [
    '/api/utils/cors-test',
    '/api/cors-test',
    '/utils/cors-test',
    '/cors-test'
  ];
  
  // Try each endpoint until one works
  let testResult: TestResult | null = null;
  
  for (const endpoint of corsEndpoints) {
    try {
      const testUrl = getApiUrl(endpoint);
      console.log(`Testing CORS endpoint: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Check content type to avoid parsing HTML as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Received non-JSON response from ${endpoint}:`, text.substring(0, 100));
        
        // Record the failure for diagnostics
        if (!testResult) {
          testResult = {
            success: false,
            status: response.status,
            statusText: response.statusText,
            error: `Received non-JSON response: ${text.substring(0, 50)}...`,
            details: {
              url: testUrl,
              contentType,
              endpoint
            }
          };
        }
        
        continue; // Try next endpoint
      }
      
      if (response.ok) {
        const data = await response.json();
        testResult = {
          success: true,
          status: response.status,
          data,
          details: {
            url: testUrl,
            endpoint
          }
        };
        console.log(`CORS test successful with endpoint ${endpoint}:`, data);
        break; // Success, exit the loop
      } else {
        testResult = {
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: `API returned error status: ${response.status} ${response.statusText}`,
          details: {
            url: testUrl,
            endpoint
          }
        };
      }
    } catch (error) {
      console.warn(`Error testing CORS with endpoint ${endpoint}:`, error.message);
      // Record the error for diagnostics
      if (!testResult) {
        testResult = {
          success: false,
          error: `Fetch error: ${error.message}`,
          details: {
            endpoint,
            errorName: error.name,
            isCORS: error.message?.includes('CORS')
          }
        };
      }
      // Continue to try next endpoint
    }
  }
  
  // If we found a working endpoint
  if (testResult) {
    results.corsTest = testResult;
  } else {
    // All endpoints failed
    results.corsTest = {
      success: false,
      error: "All CORS test endpoints failed. See console for details."
    };
  }

  // Test browser headers to detect potential CORS issues
  try {
    // ... existing code for headers test ...
  } catch (error) {
    // ... existing error handling code ...
  }

  // Test current user API to check authentication
  try {
    // ... existing code for user test ...
  } catch (error) {
    // ... existing error handling code ...
  }
  
  return results;
};

export default function Survey() {
  const [, navigate] = useLocation();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [corsStatus, setCorsStatus] = useState<any>(null);
  const [roleData, setRoleData] = useState({
    currentRole: "",
    targetRole: ""
  });

  // Run CORS test on component mount
  useEffect(() => {
    testCors().then(result => {
      setCorsStatus(result);
    });
  }, []);

  // Get current user
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      try {
        // Use the getApiUrl function for consistent URL handling
        const url = getApiUrl('/users/me');
        console.log('Fetching user from:', url);
        
        // First attempt with redirect: error
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          },
          redirect: 'error'  // Don't follow redirects initially
        }).catch(error => {
          // If there's a redirect error, try again with redirect: follow
          if (error.message && (
              error.message.includes('redirect') || 
              error.message.includes('Redirect')
            )) {
            console.log('Detected redirect issue, retrying with redirect: follow');
            return fetch(url, {
              method: 'GET',
              mode: 'cors',
              credentials: 'include',
              headers: {
                'Accept': 'application/json'
              },
              redirect: 'follow'  // Allow redirects on retry
            });
          }
          throw error; // Re-throw if it's not a redirect error
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get user data: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: 1
  });

  // Handle completion of each step
  const handleStepComplete = async () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  // Handle step changes from the SurveySteps component
  const handleStepChange = (newStep: number, data?: any) => {
    console.log('Step changed to:', newStep, 'Data:', data); // Debug log
    setCurrentStep(newStep);
    
    // Save role data if provided
    if (data && data.currentRole && data.targetRole) {
      setRoleData({
        currentRole: data.currentRole,
        targetRole: data.targetRole
      });
      console.log('Updated role data:', data);
    }
  };

  if (isLoadingUser) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading your profile...</p>
    </div>;
  }

  // Display any CORS or API errors if they occur
  if (userError) {
    return <div className="min-h-screen bg-background flex items-center justify-center flex-col p-4">
      <h2 className="text-xl font-semibold mb-4">Connection Issue Detected</h2>
      <p className="text-muted-foreground mb-2">We're having trouble connecting to our servers.</p>
      <div className="w-full max-w-lg">
        <div className="text-sm mb-4">
          <p className="font-medium mb-1">Technical Details:</p>
          <p className="text-xs text-gray-600 mb-1">API URL: {import.meta.env.VITE_API_URL || 'Not defined'}</p>
          <p className="text-xs text-gray-600 mb-1">Current Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p className="text-xs text-gray-600 mb-1">Environment: {import.meta.env.MODE}</p>
        </div>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-w-full max-h-48">
          {JSON.stringify({error: userError, corsStatus}, null, 2)}
        </pre>
      </div>
      <div className="flex space-x-4 mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Retry Connection
        </button>
        <button 
          onClick={async () => {
            // Test the connection to the CORS endpoint
            try {
              // Always use relative URL in production
              const isProduction = import.meta.env.MODE === 'production';
              const hostname = window.location.hostname;
              const isProductionDomain = hostname.includes('www.careerpathfinder.io');
              
              const corsTestUrl = isProduction && isProductionDomain
                ? '/api/cors-test'  // Use relative URL in production
                : `${import.meta.env.VITE_API_URL || ''}/api/cors-test`;
                
              const response = await fetch(corsTestUrl, { 
                mode: 'cors', 
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
              });
              const result = await response.json();
              alert(`CORS Test: ${JSON.stringify(result, null, 2)}`);
            } catch (error) {
              alert(`CORS Test Failed: ${error.message}`);
            }
          }} 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
        >
          Test Connection
        </button>
      </div>
    </div>;
  }

  const handleComplete = async () => {
    try {
      console.log("Attempting to complete survey...");
      
      // Add retry logic for the survey completion endpoint
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Completion attempt ${attempts + 1}/${maxAttempts}`);
          
          // Use fetch directly with more control over the request
          const response = await fetch('/api/survey/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
          });
          
          console.log('Survey completion response status:', response.status);
          
          if (!response.ok) {
            let errorMessage = `Failed to complete survey: ${response.status}`;
            let errorDetails = '';
            
            try {
              const errorText = await response.text();
              console.error('Survey completion error response:', errorText);
              
              // Try to parse the error as JSON
              if (errorText && errorText.includes('{')) {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) {
                  if (typeof errorJson.error === 'string') {
                    errorMessage = errorJson.error;
                  } else if (errorJson.error.message) {
                    errorMessage = errorJson.error.message;
                    if (errorJson.error.details) {
                      errorDetails = errorJson.error.details;
                    }
                  }
                }
              }
            } catch (parseError) {
              console.error('Failed to parse error response:', parseError);
            }
            
            throw new Error(errorMessage);
          }
          
          console.log('Survey completed successfully');
          
          // Invalidate user data cache to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ['user'] });
          
          // Navigate to dashboard
          navigate("/dashboard");
          return;
        } catch (err) {
          console.error(`Error in completion attempt ${attempts + 1}:`, err);
          lastError = err;
          attempts++;
          
          if (attempts >= maxAttempts) {
            break;
          }
          
          // Wait before retry (increasing delay with each attempt)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      console.error("All survey completion attempts failed");
      const errorMessage = lastError instanceof Error 
        ? lastError.message 
        : 'Unknown error occurred';

      alert(`We're having trouble completing your survey. We'll direct you to your dashboard, but some content may be missing. Please try again later or contact support.\n\nError: ${errorMessage}`);

      // Still navigate to dashboard even on error
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete survey:", error);
      alert("Failed to complete survey. Please try again or contact support if the problem persists.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Career Profile Setup
            </h1>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {currentStep === 1 && (
            <SurveySteps 
              onComplete={handleStepComplete} 
              onStepChange={handleStepChange}
            />
          )}

          {currentStep === 2 && (
            <ResumeUpload 
              onComplete={handleStepComplete} 
              currentRole={roleData.currentRole}
              targetRole={roleData.targetRole}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-6 p-6 bg-card rounded-lg border">
              <h2 className="text-2xl font-semibold">Almost There!</h2>
              <p className="text-muted-foreground">
                We've analyzed your profile and prepared personalized recommendations for you.
              </p>
              <img
                src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6"
                alt="Success"
                className="rounded-lg w-full"
              />
              <button
                onClick={handleComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Continue to Recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}