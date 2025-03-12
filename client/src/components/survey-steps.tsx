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

// Add test function to diagnose API connectivity
const testApiEndpoint = async () => {
  try {
    console.log("Testing API connectivity...");
    const response = await fetch("/api/test", {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log("Test response status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Test endpoint response:", data);
      return true;
    } else {
      console.error("Test endpoint failed with status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error testing API endpoint:", error);
    return false;
  }
};

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
        // Test the API connectivity first
        const testResult = await testApiEndpoint();
        console.log("API test result:", testResult);
        
        // Log additional debugging info
        console.log("Environment:", import.meta.env.MODE);
        console.log("Current URL:", window.location.href);
        
        const response = await apiRequest("POST", "/api/survey/roles", data);
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries([...response.headers]));
        
        // Handle non-200 status codes
        if (!response.ok) {
          // Try to parse error message from response
          let errorText = await response.text();
          let errorJson;
          
          try {
            errorJson = JSON.parse(errorText);
            // Handle structured error responses
            if (errorJson.error && typeof errorJson.error === 'object') {
              throw new Error(JSON.stringify(errorJson));
            } else {
              throw new Error(errorJson.error || `Server error: ${response.status}`);
            }
          } catch (parseError) {
            // If we can't parse the JSON, use the raw text or status code
            throw new Error(errorText || `Server error: ${response.status}`);
          }
        }
        
        // Process successful response
        let responseText = await response.text();
        
        // Handle empty response
        if (!responseText || responseText.trim() === '') {
          throw new Error("Server returned empty response");
        }
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          // Provide more specific error message for debugging
          if (responseText.includes("<!DOCTYPE html>")) {
            throw new Error("Server returned HTML instead of JSON (likely a routing issue)");
          } else {
            throw new Error("Server returned invalid JSON: " + responseText.substring(0, 100) + "...");
          }
        }
        
        return responseData;
      } catch (error) {
        console.error("Error in saveRoles mutation:", error);
        
        // Improved error handling
        if (error instanceof Error) {
          // Pass the error message directly
          throw error;
        } else if (typeof error === 'object' && error !== null) {
          // Format object errors properly
          throw new Error(JSON.stringify(error));
        } else {
          // Handle other error types
          throw new Error(`Unknown error: ${String(error)}`);
        }
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
  );
}