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
        
        if (!response.ok) {
          let errorText = await response.text();
          let errorJson;
          
          try {
            errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              // Handle structured error responses
              const errorMessage = typeof errorJson.error === 'object' 
                ? errorJson.error.message || 'Unknown error'
                : errorJson.error;
              throw new Error(errorMessage);
            }
          } catch (parseError) {
            // If we can't parse the JSON, use a user-friendly message
            if (response.status === 503) {
              throw new Error("The resume analysis service is temporarily unavailable. Please try again later.");
            } else if (response.status === 429) {
              throw new Error("The service is currently at capacity. Please try again in a few minutes.");
            } else {
              throw new Error("An error occurred while analyzing your resume. Please try again.");
            }
          }
        }
        
        // Process successful response
        let responseText = await response.text();
        
        if (!responseText || responseText.trim() === '') {
          throw new Error("The server returned an empty response. Please try again.");
        }
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error("There was a problem processing the server response. Please try again.");
        }
        
        return responseData;
      } catch (error) {
        console.error("Error in resume analysis:", error);
        if (error instanceof Error) {
          // Use the error message directly if it's user-friendly
          throw error;
        } else {
          throw new Error("An unexpected error occurred. Please try again later.");
        }
      }
    },
    onSuccess: (data) => {
      console.log("Resume analysis successful:", data);
      setAnalysisResult(data.skillGap);
      setErrorMessage(""); // Clear any previous errors
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onComplete();
    },
    onError: (error: Error) => {
      console.error("Resume analysis error:", error);
      setErrorMessage(error.message);
      // Don't clear previous analysis result on error
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    mutate(resumeText);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Paste your resume text
          </label>
          <textarea
            id="resume"
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
          />
        </div>
        
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{errorMessage}</div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !resumeText.trim()}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isPending || !resumeText.trim()
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isPending ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>
    </div>
  );
}