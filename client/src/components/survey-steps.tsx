import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { surveySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";

type SurveyStepsProps = {
  onComplete: () => void;
};

const INDUSTRIES = [
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

export function SurveySteps({ onComplete }: SurveyStepsProps) {
  const { toast } = useToast();

  const form = useForm({
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

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: unknown) => {
      console.log("Submitting survey data:", data); // Debug log
      const response = await apiRequest("POST", "/api/survey", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save survey data");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey completed",
        description: "Your career preferences have been saved.",
      });
      onComplete();
    },
    onError: (error) => {
      console.error("Survey submission error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save survey data",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-6">
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
                  onChange={field.onChange}
                  placeholder="Select industries..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </Form>
  );
}