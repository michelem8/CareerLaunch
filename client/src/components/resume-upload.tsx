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

      console.log("Submitting resume for analysis...");
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
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
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
          <AlertTitle>Error</AlertTitle>
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
    </div>
  );
}