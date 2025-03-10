import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SurveySteps } from "@/components/survey-steps";
import { ResumeUpload } from "@/components/resume-upload";
import { Progress } from "@/components/ui/progress";

// Enhanced CORS testing function with better diagnostics
const testCors = async () => {
  try {
    console.log('Testing CORS connection...');
    console.log('Origin:', window.location.origin);
    console.log('API Base URL:', import.meta.env.VITE_API_URL || 'Not set (using relative URLs)');
    
    // Define the proper TypeScript interface for our results
    interface TestResult {
      success: boolean;
      status?: number;
      statusText?: string;
      data?: any;
      error?: string;
    }
    
    interface TestResults {
      corsTest?: TestResult;
      headersTest?: TestResult;
      userTest?: TestResult;
      overallError?: string;
      browserInfo?: {
        userAgent: string;
        origin: string;
      };
    }
    
    const results: TestResults = {};
    
    // Test 1: Test the CORS test endpoint
    const testUrl = `${import.meta.env.VITE_API_URL || ''}/api/cors-test`;
    console.log('Testing CORS test endpoint:', testUrl);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('CORS test successful:', data);
        results.corsTest = {
          success: true,
          data
        };
      } else {
        console.error('CORS test failed with status:', response.status);
        results.corsTest = {
          success: false,
          status: response.status,
          statusText: response.statusText
        };
      }
    } catch (error) {
      console.error('CORS test error:', error);
      results.corsTest = {
        success: false,
        error: error.message
      };
    }
    
    // Test 2: Get request headers
    const headersUrl = `${import.meta.env.VITE_API_URL || ''}/api/debug/headers`;
    console.log('Testing headers endpoint:', headersUrl);
    
    try {
      const response = await fetch(headersUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Headers test successful:', data);
        results.headersTest = {
          success: true,
          data
        };
      } else {
        console.error('Headers test failed with status:', response.status);
        results.headersTest = {
          success: false,
          status: response.status,
          statusText: response.statusText
        };
      }
    } catch (error) {
      console.error('Headers test error:', error);
      results.headersTest = {
        success: false,
        error: error.message
      };
    }
    
    // Test 3: Try to get user data with preflight handling
    const userUrl = `${import.meta.env.VITE_API_URL || ''}/api/users/me`;
    console.log('Testing user endpoint:', userUrl);
    
    try {
      // First attempt with redirect: error
      const response = await fetch(userUrl, {
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
          return fetch(userUrl, {
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
      
      results.userTest = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
      
      if (response.ok) {
        const data = await response.json();
        console.log('User test successful:', data);
        results.userTest.data = data;
      } else {
        console.error('User test failed with status:', response.status);
      }
    } catch (error) {
      console.error('User test error:', error);
      results.userTest = {
        success: false,
        error: error.message
      };
    }
    
    return results;
  } catch (error) {
    console.error('CORS tests failed:', error);
    return { 
      overallError: error.message,
      browserInfo: {
        userAgent: navigator.userAgent,
        origin: window.location.origin
      } 
    };
  }
};

export default function Survey() {
  const [, navigate] = useLocation();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [corsStatus, setCorsStatus] = useState<any>(null);

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
        // Use the API URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const url = `${apiUrl}/api/users/me`;
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
  const handleStepChange = (newStep: number) => {
    console.log('Step changed to:', newStep); // Debug log
    setCurrentStep(newStep);
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
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-w-full">
        {JSON.stringify({error: userError, corsStatus}, null, 2)}
      </pre>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
      >
        Retry Connection
      </button>
    </div>;
  }

  const handleComplete = async () => {
    try {
      await apiRequest("POST", "/api/survey/complete");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete survey:", error);
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
            <ResumeUpload onComplete={handleStepComplete} />
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