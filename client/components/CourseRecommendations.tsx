import React from 'react';

interface Course {
  id: string;
  title: string;
  platform: string;
  duration: string;
  skillCategory: string;
  description: string;
  link: string;
}

interface CourseRecommendationsProps {
  missingSkills: string[];
}

const COURSE_CATALOG: Course[] = [
  {
    id: '1',
    title: 'Python Programming Fundamentals',
    platform: 'Coursera',
    duration: '8 weeks',
    skillCategory: 'Core Programming Skills (Python, JavaScript)',
    description: 'A comprehensive introduction to Python programming language.',
    link: 'https://coursera.org/python-fundamentals'
  },
  {
    id: '2',
    title: 'JavaScript Essentials',
    platform: 'Udemy',
    duration: '6 weeks',
    skillCategory: 'Core Programming Skills (Python, JavaScript)',
    description: 'Master JavaScript fundamentals and modern ES6+ features.',
    link: 'https://udemy.com/javascript-essentials'
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms Masterclass',
    platform: 'Coursera',
    duration: '12 weeks',
    skillCategory: 'Data Structures and Algorithms',
    description: 'Learn fundamental data structures and algorithms with practical examples.',
    link: 'https://coursera.org/dsa-masterclass'
  },
  {
    id: '4',
    title: 'Object-Oriented Programming Principles',
    platform: 'edX',
    duration: '10 weeks',
    skillCategory: 'Object-Oriented Programming',
    description: 'Deep dive into OOP concepts with real-world applications.',
    link: 'https://edx.org/oop-principles'
  }
];

const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({ missingSkills }) => {
  if (!missingSkills.length) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
        <p>No skill gaps identified</p>
      </div>
    );
  }

  const relevantCourses = COURSE_CATALOG.filter(course =>
    missingSkills.some(skill => course.skillCategory.includes(skill))
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relevantCourses.map(course => (
          <div
            key={course.id}
            data-testid="course-card"
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <div className="text-sm text-gray-500">
              <p><span className="font-medium">Platform:</span> {course.platform}</p>
              <p><span className="font-medium">Duration:</span> {course.duration}</p>
            </div>
            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Learn More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRecommendations; 