import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Accelerate Your Career Growth
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Get personalized career guidance and learning recommendations based on your goals and experience.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/survey")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
