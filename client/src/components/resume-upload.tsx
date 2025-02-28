import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type ResumeUploadProps = {
  onComplete: () => void;
};

export function ResumeUpload({ onComplete }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("");
  const { toast } = useToast();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) {
        throw new Error("Please enter your resume content before analyzing");
      }

      const response = await apiRequest("POST", "/api/resume/analyze", { resumeText: text });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Resume analysis successful:", data);
      toast({
        title: "Resume analyzed successfully",
        description: "Your skills and experience have been analyzed. Proceeding to recommendations.",
      });
      onComplete();
    },
    onError: (error) => {
      console.error("Resume analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze resume";

      // Show a more user-friendly message for rate limit errors
      const isBusyError = errorMessage.includes("busy") || errorMessage.includes("try again");

      toast({
        variant: "destructive",
        title: isBusyError ? "Service Busy" : "Analysis Failed",
        description: isBusyError 
          ? "Our analysis service is experiencing high demand. Please try again in a few minutes."
          : errorMessage,
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed rounded-lg">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Upload Your Resume</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Paste your resume content below for AI-powered analysis
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
            {error instanceof Error && error.message.includes("busy") 
              ? "Service Busy" 
              : "Error"}
          </AlertTitle>
          <AlertDescription>
            {error instanceof Error && error.message.includes("busy")
              ? "Our analysis service is experiencing high demand. Please try again in a few minutes."
              : error instanceof Error 
                ? error.message 
                : "Failed to analyze resume. Please try again."}
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
    </div>
  );
}