import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Course {
  id: string;
  title: string;
  description: string;
  platform: string;
  difficulty: string;
  duration: string;
  skills: string[];
  url: string;
  rating?: number;
  price?: string;
  aiMatchScore?: number;
}

interface CourseRecommendationsProps {
  missingSkills: string[];
}

const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({ missingSkills }) => {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses', missingSkills],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      missingSkills.forEach(skill => queryParams.append('skills', skill));
      const response = await apiRequest('GET', `/api/courses/recommended?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course recommendations');
      }
      return response.json();
    },
    enabled: missingSkills.length > 0,
  });

  if (!missingSkills.length) {
    console.log('Rendering: No skill gaps identified');
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
        <p className="text-gray-500">No skill gaps identified</p>
      </div>
    );
  }

  if (isLoading) {
    console.log('Rendering: Loading state');
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">AI-Powered Course Recommendations</h2>
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Analyzing your profile and generating personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering: Error state -', error);
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error instanceof Error ? error.message : 'Failed to load courses'}
        </div>
      </div>
    );
  }

  if (!courses?.length) {
    console.log('Rendering: No courses available');
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
        <p className="text-gray-500">No courses available for your skill gaps. Please check back later.</p>
      </div>
    );
  }

  console.log('Rendering:', courses.length, 'courses');
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold">AI-Powered Course Recommendations</h2>
        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          AI Enhanced
        </span>
      </div>
      <p className="text-gray-600 mb-6">
        Courses are intelligently ranked based on your skill gaps and career goals.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <div
            key={course.id}
            data-testid="course-card"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded text-xs font-medium mb-1 ${
                  course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.difficulty}
                </span>
                {course.aiMatchScore && (
                  <span className="text-xs text-gray-500">
                    Match Score: {course.aiMatchScore}%
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              <p className="mb-1"><span className="font-medium">Platform:</span> {course.platform}</p>
              <p className="mb-1"><span className="font-medium">Duration:</span> {course.duration}</p>
              {course.price && (
                <p className="mb-1"><span className="font-medium">Price:</span> {course.price}</p>
              )}
              {course.rating && (
                <p><span className="font-medium">Rating:</span> {course.rating}/5</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white"
                >
                  {skill}
                </span>
              ))}
            </div>
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Course
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRecommendations; 