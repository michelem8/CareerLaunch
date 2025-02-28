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
            <Button size="lg" onClick={() => navigate("/survey")}>
              Start Your Journey
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1425421669292-0c3da3b8f529"
              alt="Career Planning"
              className="aspect-video w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">Career Planning</h3>
              <p className="text-sm text-muted-foreground">Map your career journey with expert guidance</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1496180470114-6ef490f3ff22"
              alt="Skill Development"
              className="aspect-video w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">Skill Development</h3>
              <p className="text-sm text-muted-foreground">Learn the skills that matter for your growth</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1491336477066-31156b5e4f35"
              alt="Resume Analysis"
              className="aspect-video w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">Resume Analysis</h3>
              <p className="text-sm text-muted-foreground">Get insights from AI-powered resume analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
