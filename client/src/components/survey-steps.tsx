import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { surveySchema, rolesSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { useState } from "react";
import { z } from "zod";
import { getApiUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Test API connectivity
const testApiEndpoint = async () => {
  try {
    console.log("Testing API connectivity...");
    
    // Try multiple test endpoints in sequence for better reliability
    const testEndpoints = [
      '/api/test',
      '/api/utils/test',
      '/api/diagnostics',
      '/api/health'
    ];
    
    console.log("Environment:", import.meta.env.MODE);
    console.log("Current location:", window.location.href);
    
    // Try each endpoint in sequence
    for (const endpoint of testEndpoints) {
      try {
        const testUrl = getApiUrl(endpoint);
        console.log(`Trying API URL: ${testUrl}`);
        
        const response = await fetch(testUrl, {
          method: "GET",
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        console.log(`Response from ${endpoint}:`, {
          status: response.status,
          headers: Object.fromEntries([...response.headers])
        });
        
        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error(`Received non-JSON response from ${endpoint}:`, text.substring(0, 100));
          // Continue to the next endpoint
          continue;
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Successful response from ${endpoint}:`, data);
          return { 
            success: true, 
            data,
            endpoint,
            url: testUrl
          };
        } else {
          console.error(`Endpoint ${endpoint} failed with status:`, response.status);
          // Continue to next endpoint
          continue;
        }
      } catch (err) {
        console.error(`Error with endpoint ${endpoint}:`, err);
        // Continue to next endpoint
        continue;
      }
    }
    
    // If we get here, all endpoints failed
    return { 
      success: false, 
      error: "All API endpoints failed. The API server may be unreachable.",
      attempted: testEndpoints
    };
  } catch (error) {
    console.error("Error testing API endpoint:", error);
    // Check if this is a CORS error or a JSON parse error
    const isCorsError = error.message?.includes('CORS');
    const isJsonError = error.message?.includes('JSON');
    
    if (isJsonError) {
      console.error("JSON parsing error. Server likely returned HTML instead of JSON.");
      return { 
        success: false, 
        error: "Received HTML instead of JSON. Check API endpoint configuration.",
        isJsonError 
      };
    }
    
    if (isCorsError) {
      console.error("This appears to be a CORS issue. Check server configuration.");
      // Try with a relative URL as fallback if we're in production
      if (import.meta.env.MODE === 'production' && !window.location.href.includes('/cors-debug')) {
        console.log("Redirecting to CORS debug page...");
        window.location.href = '/cors-debug';
        return { success: false, error: error.message, redirected: true };
      }
    }
    return { success: false, error: error.message, isCorsError };
  }
};

// CORS Test Component
function ApiConnectivityTest() {
  const [testResult, setTestResult] = useState<null | {
    success: boolean;
    data?: any;
    status?: number;
    error?: string;
    endpoint?: string;
    url?: string;
    attempted?: string[];
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await testApiEndpoint();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Connectivity Test</CardTitle>
        <CardDescription>
          Test the connection to the API server to diagnose any CORS issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          variant="outline"
          className="mb-4"
        >
          {isLoading ? "Testing..." : "Run API Test"}
        </Button>
        
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertTitle>
              {testResult.success ? "API Connection Successful" : "API Connection Failed"}
            </AlertTitle>
            <AlertDescription>
              {testResult.success ? (
                <div>
                  <p>Successfully connected to the API server via: <code>{testResult.endpoint}</code></p>
                  {testResult.data && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-bold text-red-500">Failed to connect to the API server</p>
                  {testResult.status && <p>Status: {testResult.status}</p>}
                  {testResult.error && <p>Error: {testResult.error}</p>}
                  {testResult.url && <p>URL attempted: <code>{testResult.url}</code></p>}
                  {testResult.attempted && (
                    <p>Attempted endpoints: {testResult.attempted.map(ep => 
                      <code key={ep} className="mx-1">{ep}</code>)}
                    </p>
                  )}
                  {testResult.error?.includes('CORS') && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-500 font-bold">
                        CORS Error Detected: The API server is not allowing requests from this domain.
                      </p>
                      <p className="text-sm mt-1">
                        This is likely a server configuration issue. Try using a dedicated API domain 
                        or properly configuring CORS headers on your server.
                      </p>
                    </div>
                  )}
                  {testResult.error?.includes('HTML') && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-500 font-bold">
                        HTML Response Detected: The server is returning the frontend application HTML instead of JSON API data.
                      </p>
                      <p className="text-sm mt-1">
                        This typically happens when your frontend server is handling all routes and not forwarding API requests to your backend.
                        Make sure you're using the correct API URL that points to your actual API server.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="font-semibold">Troubleshooting Tips:</p>
                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                      <li>Ensure your API server is running and accessible</li>
                      <li>Verify that the API URL is correctly configured ({import.meta.env.VITE_API_URL || 'not set'})</li>
                      <li>Check that CORS is properly configured on your server</li>
                      <li>In production, consider using a separate domain for your API (e.g., api.careerpathfinder.io)</li>
                    </ul>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

type SurveyStepsProps = {
  onComplete: () => void;
  onStepChange: (step: number, data?: any) => void;
};

type Step = 1 | 2 | 3;

const isValidStep = (step: number): step is Step => {
  return step >= 1 && step <= 3;
};

// Define the form schema type
type FormData = z.infer<typeof surveySchema>;

const INDUSTRIES = [
  { value: "any", label: "Any industry" },
  { value: "consumer", label: "Consumer-Facing Tech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "education", label: "Education" },
  { value: "enterprise-software", label: "Enterprise Software" },
  { value: "marketplaces", label: "Marketplaces" },
  { value: "fintech", label: "FinTech" },
  { value: "ai-ml", label: "Artificial Intelligence & Machine Learning" },
  { value: "cloud", label: "Cloud Computing & Infrastructure" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "iot", label: "Internet of Things (IoT)" },
  { value: "ar-vr", label: "Augmented Reality (AR) & Virtual Reality (VR)" },
  { value: "mobility-automotive", label: "Mobility & Automotive" },
  { value: "robotics-automation", label: "Robotics & Automation" },
  { value: "cleantech-sustainability", label: "CleanTech & Sustainability" },
  { value: "martech-adtech", label: "Marketing Tech (MarTech) & Advertising Tech (AdTech)" },
];

const LEARNING_STYLES = [
  { value: "visual", label: "Visual Learning" },
  { value: "practical", label: "Hands-on Practice" },
  { value: "theoretical", label: "Theoretical Study" },
  { value: "collaborative", label: "Group Learning" },
  { value: "self-paced", label: "Self-Paced" },
  { value: "interactive", label: "Interactive Workshops" },
  { value: "mentorship", label: "One-on-One Mentorship" },
  { value: "project_based", label: "Project-Based Learning" },
];

export function SurveySteps({ onComplete, onStepChange }: SurveyStepsProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showApiTest, setShowApiTest] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const totalSteps = 3;

  const updateStep = (step: Step) => {
    setCurrentStep(step);
    // Pass the current form data when updating steps
    if (step === 2) {
      // Pass role data when moving to step 2
      const roleData = {
        currentRole: form.getValues('currentRole'),
        targetRole: form.getValues('targetRole')
      };
      onStepChange(step, roleData);
    } else {
      onStepChange(step);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      currentRole: "",
      targetRole: "",
      preferences: {
        preferredIndustries: [],
        learningStyles: [],
        timeCommitment: "",
      },
    },
  });

  const rolesForm = useForm<z.infer<typeof rolesSchema>>({
    resolver: zodResolver(rolesSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: unknown) => {
      console.log("Submitting survey data:", data);
      const response = await apiRequest("POST", "/api/survey", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save survey data");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Only call onComplete when we have all the data (step 3)
      if (currentStep === 3) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        onComplete();
      }
    },
    onError: (error) => {
      console.error("Survey submission error:", error);
      toast({
        title: "Error",
        description: "Failed to save survey data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: saveRoles } = useMutation({
    mutationFn: async (data: { currentRole: string; targetRole: string }) => {
      console.log("Saving roles:", data);
      try {
        // Log additional debugging info
        console.log("Environment:", import.meta.env.MODE);
        console.log("Current URL:", window.location.href);
        
        // Create an array of endpoints to try in order
        const endpoints = [
          '/api/survey/roles',           // Primary endpoint
          '/api/direct/survey/roles',    // Simple direct endpoint without type issues
          '/api/test/survey/roles',      // Test fallback endpoint
          '/api/v1/survey/roles',        // Try with version prefix
          '/api/career/survey/roles'     // Try with career prefix
        ];
        
        let lastError: Error | null = null;
        let responseData = null;
        
        // Try each endpoint in sequence until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            const url = getApiUrl(endpoint);
            console.log(`Full URL: ${url}`);
            
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(data),
              credentials: 'include',
              mode: 'cors'
            });
            
            console.log(`Response from ${endpoint}:`, {
              status: response.status,
              headers: Object.fromEntries([...response.headers])
            });
            
            // Check content type before attempting to parse
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await response.text();
              console.log(`Non-JSON response from ${endpoint}:`, text.substring(0, 150));
              throw new Error(`Server returned non-JSON content type: ${contentType}`);
            }
            
            // Handle non-OK responses
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            // Successfully got JSON response
            responseData = await response.json();
            console.log(`Successfully parsed response from ${endpoint}:`, responseData);
            
            // Exit the loop on success
            break;
          } catch (err) {
            console.error(`Error with endpoint ${endpoint}:`, err);
            lastError = err instanceof Error ? err : new Error(String(err));
            
            // Continue to the next endpoint
            continue;
          }
        }
        
        // After trying all endpoints, if we have data, return it
        if (responseData) {
          return responseData;
        }
        
        // Otherwise, throw the last error
        throw lastError || new Error("All endpoints failed with unknown errors");
      } catch (error) {
        console.error("Error in saveRoles mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Successfully saved roles:", data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "Success",
        description: "Your roles have been saved.",
      });
    },
    onError: (error: Error) => {
      console.error("Role save error:", error);
      
      // Try to parse structured error from JSON string
      let errorMessage = "Failed to save your roles. Please try again.";
      try {
        // Check if the error is a stringified JSON object
        if (error.message.startsWith('{') && error.message.endsWith('}')) {
          const errorJson = JSON.parse(error.message);
          if (errorJson.error) {
            if (typeof errorJson.error === 'object' && errorJson.error.message) {
              errorMessage = errorJson.error.message;
              // Add details if available
              if (errorJson.error.details) {
                console.error("Error details:", errorJson.error.details);
              }
            } else {
              errorMessage = String(errorJson.error);
            }
          }
        }
      } catch (e) {
        // If we can't parse the JSON, use the original error message
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleIndustryChange = (values: string[]) => {
    // If "any" is being added and there are other selections, clear them
    if (values.includes("any") && values.length > 1) {
      form.setValue("preferences.preferredIndustries", ["any"]);
      return;
    }

    // If a specific industry is being added and "any" is selected, remove "any"
    if (values.some(v => v !== "any") && values.includes("any")) {
      const filteredValues = values.filter(v => v !== "any");
      form.setValue("preferences.preferredIndustries", filteredValues);
      return;
    }

    form.setValue("preferences.preferredIndustries", values);
  };

  const handleContinue = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        const formData = form.getValues();
        // Trim the values to remove any whitespace
        const rolesData = {
          currentRole: formData.currentRole.trim(),
          targetRole: formData.targetRole.trim(),
        };
        
        // Validate the roles data
        try {
          // Set the values back to the form after trimming
          form.setValue("currentRole", rolesData.currentRole);
          form.setValue("targetRole", rolesData.targetRole);
          
          // Validate the data
          await rolesSchema.parseAsync(rolesData);
          
          // Save the roles
          await saveRoles(rolesData);
          isValid = true;
        } catch (error) {
          console.error("Validation error:", error);
          // Show validation errors in the form
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              if (err.path.includes("currentRole")) {
                form.setError("currentRole", { message: err.message });
              }
              if (err.path.includes("targetRole")) {
                form.setError("targetRole", { message: err.message });
              }
            });
          }
          return;
        }
        break;
      case 2:
        isValid = await form.trigger(['preferences.preferredIndustries']);
        break;
      case 3:
        isValid = await form.trigger(['preferences.learningStyles', 'preferences.timeCommitment']);
        if (isValid) {
          // Submit the complete form data
          form.handleSubmit((data) => mutate(data))();
          return;
        }
        break;
    }

    if (isValid) {
      const nextStep = currentStep + 1;
      if (isValidStep(nextStep)) {
        updateStep(nextStep);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Add API Connectivity Test with toggle */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowApiTest(!showApiTest)}
          className="text-muted-foreground hover:text-primary"
        >
          {showApiTest ? "Hide API Test" : "Show API Test"}
        </Button>
        
        {showApiTest && <ApiConnectivityTest />}
      </div>
  
      <h1 className="text-2xl font-bold mb-6">
        {currentStep === 1 && "Your Career Goals"}
        {currentStep === 2 && "Your Skills & Experience"}
        {currentStep === 3 && "Your Learning Preferences"}
      </h1>
      
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {currentStep === 1 && (
            <>
              <FormField
                control={form.control}
                name="currentRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {currentStep === 2 && (
            <FormField
              control={form.control}
              name="preferences.preferredIndustries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industries of Interest</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={INDUSTRIES}
                      selected={field.value || []}
                      onChange={handleIndustryChange}
                      placeholder="Select industries..."
                      disabledOptions={field.value?.includes("any") ? INDUSTRIES.filter(i => i.value !== "any").map(i => i.value) : []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 3 && (
            <>
              <FormField
                control={form.control}
                name="preferences.learningStyles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Styles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={LEARNING_STYLES}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select learning styles..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Time Commitment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time commitment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2-4">2-4 hours</SelectItem>
                        <SelectItem value="4-8">4-8 hours</SelectItem>
                        <SelectItem value="8+">8+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const prevStep = currentStep - 1;
                  if (isValidStep(prevStep)) {
                    updateStep(prevStep);
                  }
                }}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              className={currentStep === 1 ? "w-full" : ""}
              onClick={handleContinue}
              disabled={isPending}
            >
              {currentStep === 3 ? (isPending ? "Saving..." : "Submit") : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}