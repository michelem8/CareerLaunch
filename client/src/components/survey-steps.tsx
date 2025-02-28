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

type SurveyStepsProps = {
  onComplete: () => void;
};

const INDUSTRIES = [
  { id: "technology", label: "Technology" },
  { id: "healthcare", label: "Healthcare" },
  { id: "finance", label: "Finance" },
  { id: "education", label: "Education" },
  { id: "retail", label: "Retail" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "consulting", label: "Consulting" },
  { id: "media", label: "Media & Entertainment" },
  { id: "nonprofit", label: "Non-Profit" },
  { id: "government", label: "Government" },
  { id: "energy", label: "Energy & Utilities" },
  { id: "transportation", label: "Transportation & Logistics" },
  { id: "real_estate", label: "Real Estate" },
  { id: "hospitality", label: "Hospitality & Tourism" },
  { id: "telecom", label: "Telecommunications" },
];

const LEARNING_STYLES = [
  { id: "visual", label: "Visual Learning" },
  { id: "practical", label: "Hands-on Practice" },
  { id: "theoretical", label: "Theoretical Study" },
  { id: "collaborative", label: "Group Learning" },
  { id: "self-paced", label: "Self-Paced" },
  { id: "interactive", label: "Interactive Workshops" },
  { id: "mentorship", label: "One-on-One Mentorship" },
  { id: "project_based", label: "Project-Based Learning" },
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
              <Select
                onValueChange={(value) => {
                  const selectedValues = value.split(",").filter(Boolean);
                  field.onChange(selectedValues);
                }}
                value={field.value?.join(",")}
                multiple
              >
                <FormControl>
                  <SelectTrigger className="h-auto">
                    <SelectValue placeholder="Select industries" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                onValueChange={(value) => {
                  const selectedValues = value.split(",").filter(Boolean);
                  field.onChange(selectedValues);
                }}
                value={field.value?.join(",")}
                multiple
              >
                <FormControl>
                  <SelectTrigger className="h-auto">
                    <SelectValue placeholder="Select learning styles" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEARNING_STYLES.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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