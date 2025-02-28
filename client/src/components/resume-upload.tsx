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
      console.log("Uploading resume text:", text); // Debug log
      const response = await apiRequest("POST", "/api/resume/analyze", { resumeText: text });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume analyzed",
        description: "Your resume has been successfully analyzed.",
      });
      onComplete();
    },
    onError: (error) => {
      console.error("Resume analysis error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to analyze resume",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed rounded-lg">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Upload Your Resume</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Or paste your resume content below
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
            Failed to analyze resume. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={() => mutate(resumeText)}
        disabled={isPending || !resumeText}
        className="w-full"
      >
        {isPending ? "Analyzing..." : "Analyze Resume"}
      </Button>
    </div>
  );
}