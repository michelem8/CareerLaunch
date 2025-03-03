import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SurveySteps } from "@/components/survey-steps";
import { ResumeUpload } from "@/components/resume-upload";
import { Progress } from "@/components/ui/progress";

export default function Survey() {
  const [, navigate] = useLocation();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);

  // Get current user
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/users/me");
        if (!response.ok) {
          throw new Error("Failed to get user data");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false
  });

  // Always start from step 1 if no user data
  const step = currentStep;

  // Handle completion of each step
  const handleStepComplete = async () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  if (isLoadingUser) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading your profile...</p>
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
            <Progress value={(step / totalSteps) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of {totalSteps}
            </p>
          </div>

          {step === 1 && (
            <SurveySteps onComplete={handleStepComplete} />
          )}

          {step === 2 && (
            <ResumeUpload onComplete={handleStepComplete} />
          )}

          {step === 3 && (
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