import { type Course } from "@shared/schema";
import { Card } from "./ui/card";
import { Badge } from "@/components/ui/badge";

type CourseCardProps = {
  course: Course;
};

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="overflow-hidden">
      {course.imageUrl && (
        <div className="h-48 bg-gray-200">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex flex-wrap gap-2">
          {course.skills.map((skill: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
