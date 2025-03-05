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

type SurveyStepsProps = {
  onComplete: () => void;
  onStepChange: (step: number) => void;
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
    onStepChange(step);
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
        const response = await apiRequest("POST", "/api/survey/roles", data);
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries([...response.headers]));
        
        // Early check for empty response
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.log("Raw response text:", text);
        
        if (!text || text.trim() === '') {
          throw new Error("Server returned empty response");
        }
        
        let responseData;
        try {
          responseData = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error("Server returned invalid JSON: " + text.substring(0, 100) + "...");
        }
        
        if (!response.ok) {
          throw new Error(responseData.error || "Failed to save roles");
        }
        
        return responseData;
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
      toast({
        title: "Error",
        description: error.message || "Failed to save roles. Please try again.",
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