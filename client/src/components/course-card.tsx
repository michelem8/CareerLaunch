import { type Course } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <img
        src={course.imageUrl}
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{course.title}</span>
          <Badge variant={course.difficulty === "beginner" ? "secondary" : "default"}>
            {course.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{course.description}</p>
        <div className="flex flex-wrap gap-2">
          {course.skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
