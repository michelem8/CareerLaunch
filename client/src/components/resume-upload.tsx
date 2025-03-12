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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) {
        throw new Error("Please enter your resume content before analyzing");
      }

      console.log("Sending resume with roles:", { currentRole, targetRole });
      
      try {
        const response = await apiRequest("POST", "/api/resume/analyze", { 
          resumeText: text,
          currentRole,
          targetRole
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries([...response.headers]));
        
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
          if (responseText.includes("<!DOCTYPE html>")) {
            throw new Error("Server returned HTML instead of JSON (likely a routing issue)");
          } else {
            throw new Error("Server returned invalid JSON: " + responseText.substring(0, 100) + "...");
          }
        }
        
        return responseData;
      } catch (error) {
        console.error("Error in resume analysis:", error);
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(`Unknown error: ${String(error)}`);
        }
      }
    },
    onSuccess: (data) => {
      console.log("Resume analysis successful:", data);
      setAnalysisResult(data.skillGap);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onComplete();
    },
    onError: (error) => {
      console.error("Resume analysis error:", error);
      
      // Try to parse structured error from JSON string
      let errorMsg = "Failed to analyze your resume. Please try again.";
      try {
        // Check if the error is a stringified JSON object
        if (error.message && error.message.startsWith('{') && error.message.endsWith('}')) {
          const errorJson = JSON.parse(error.message);
          if (errorJson.error) {
            if (typeof errorJson.error === 'object' && errorJson.error.message) {
              errorMsg = errorJson.error.message;
              // Add details if available
              if (errorJson.error.details) {
                console.error("Error details:", errorJson.error.details);
              }
            } else {
              errorMsg = String(errorJson.error);
            }
          }
        }
      } catch (e) {
        // If we can't parse the JSON, use the original error message
        errorMsg = error instanceof Error ? error.message : String(error);
      }
      
      setErrorMessage(errorMsg);
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
            {errorMessage || (error instanceof Error ? error.message : "Failed to analyze resume. Please try again.")}
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