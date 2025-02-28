import { ChevronRight } from "lucide-react";

export function CareerPath() {
  const steps = [
    {
      role: "Current: Software Engineer",
      skills: ["JavaScript", "React", "Node.js"],
      image: "https://images.unsplash.com/photo-1554774853-719586f82d77",
    },
    {
      role: "Senior Software Engineer",
      skills: ["System Design", "Team Leadership", "Architecture"],
      image: "https://images.unsplash.com/photo-1521790361543-f645cf042ec4",
    },
    {
      role: "Lead Engineer",
      skills: ["Project Management", "Mentoring", "Technical Strategy"],
      image: "https://images.unsplash.com/photo-1557804483-ef3ae78eca57",
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-start space-x-4">
        {steps.map((step, index) => (
          <div key={step.role} className="flex-1">
            <div className="relative">
              <img
                src={step.image}
                alt={step.role}
                className="w-full aspect-video object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold">{step.role}</h3>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary h-8 w-8" />
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Required Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {step.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
