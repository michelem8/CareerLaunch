import { useState } from "react";
import { useLocation } from "wouter";
import { SurveySteps } from "@/components/survey-steps";
import { ResumeUpload } from "@/components/resume-upload";
import { Progress } from "@/components/ui/progress"; 

export default function Survey() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const totalSteps = 3;

  const handleComplete = () => {
    navigate("/dashboard");
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
            <SurveySteps onComplete={() => setStep(2)} />
          )}

          {step === 2 && (
            <ResumeUpload onComplete={() => setStep(3)} />
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
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                View My Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
