import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "@/components/course-card";
import { CareerPath } from "@/components/career-path";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Course } from "@shared/schema";

export default function Dashboard() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/recommended"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Career Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">Software Engineer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">Senior Software Engineer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills to Develop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["System Design", "Leadership", "Architecture"].map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="path" className="mt-12">
          <TabsList>
            <TabsTrigger value="path">Career Path</TabsTrigger>
            <TabsTrigger value="courses">Recommended Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="path" className="mt-6">
            <CareerPath />
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            {isLoading ? (
              <div>Loading courses...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses?.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
