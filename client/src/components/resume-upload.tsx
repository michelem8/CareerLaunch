import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumeUploadProps {
  onComplete: () => void;
  currentRole?: string | null;
  targetRole?: string | null;
}

interface SkillGapAnalysis {
  missingSkills: string[];
  recommendations: string[];
}

interface ResumeAnalysisResponse {
  user: any;
  skillGap: SkillGapAnalysis;
}

export function ResumeUpload({ onComplete, currentRole, targetRole }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<SkillGapAnalysis | null>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) {
        throw new Error("Please enter your resume content before analyzing");
      }

      console.log("Sending resume with roles:", { currentRole, targetRole });
      
      const response = await apiRequest("POST", "/api/resume/analyze", { 
        resumeText: text,
        currentRole,
        targetRole
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      return response.json() as Promise<ResumeAnalysisResponse>;
    },
    onSuccess: (data) => {
      console.log("Resume analysis successful:", data);
      setAnalysisResult(data.skillGap);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onComplete();
    },
    onError: (error) => {
      console.error("Resume analysis error:", error);
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">Copy & Paste your Resume Text</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Copy the content of your resume and paste it below for AI-powered analysis
        </p>
      </div>

      <Textarea
        placeholder="Paste your resume content here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        className="min-h-[200px]"
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {error instanceof Error && error.message.includes("quota exceeded") 
              ? "API Quota Exceeded" 
              : error instanceof Error && error.message.includes("configuration")
                ? "Service Error"
                : "Error"}
          </AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to analyze resume. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={() => mutate(resumeText)}
        disabled={isPending || !resumeText.trim()}
        className="w-full"
      >
        {isPending ? "Analyzing..." : "Analyze Resume"}
      </Button>

      {analysisResult && (
        <div className="space-y-6">
          {/* Removed "Continue to Course Recommendations" button */}
        </div>
      )}
    </div>
  );
}