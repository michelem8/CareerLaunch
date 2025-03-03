import React from 'react';

interface Course {
  id: string;
  title: string;
  platform: string;
  duration: string;
  skillCategory: string;
  description: string;
  link: string;
  relatedSkills: string[];
  difficulty: string;
}

interface CourseRecommendationsProps {
  missingSkills: string[];
}

const SkillPill: React.FC<{ name: string }> = ({ name }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white">
    {name}
  </span>
);

const COURSE_CATALOG: Course[] = [
  {
    id: '1',
    title: 'Python Programming Fundamentals',
    platform: 'Coursera',
    duration: '8 weeks',
    skillCategory: 'Core Programming Skills',
    description: 'A comprehensive introduction to Python programming language, perfect for beginners transitioning into software development.',
    link: 'https://coursera.org/python-fundamentals',
    relatedSkills: ['Core Programming Skills', 'Python'],
    difficulty: 'beginner'
  },
  {
    id: '2',
    title: 'JavaScript Essentials',
    platform: 'Udemy',
    duration: '6 weeks',
    skillCategory: 'Web Development',
    description: 'Master JavaScript fundamentals and modern ES6+ features. Build interactive web applications.',
    link: 'https://udemy.com/javascript-essentials',
    relatedSkills: ['Web Development', 'JavaScript', 'Frontend Development'],
    difficulty: 'beginner'
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms Masterclass',
    platform: 'Coursera',
    duration: '12 weeks',
    skillCategory: 'Data Structures and Algorithms',
    description: 'Learn fundamental data structures and algorithms with practical examples. Essential for technical interviews.',
    link: 'https://coursera.org/dsa-masterclass',
    relatedSkills: ['Data Structures and Algorithms', 'Problem Solving'],
    difficulty: 'intermediate'
  },
  {
    id: '4',
    title: 'Object-Oriented Programming in Java',
    platform: 'edX',
    duration: '10 weeks',
    skillCategory: 'Object-Oriented Programming',
    description: 'Master OOP principles with Java. Learn about classes, inheritance, polymorphism, and design patterns.',
    link: 'https://edx.org/java-oop',
    relatedSkills: ['Object-Oriented Programming', 'Java', 'Software Design'],
    difficulty: 'intermediate'
  }
];

const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({ missingSkills }) => {
  if (!missingSkills?.length) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
        <p>No skill gaps identified</p>
      </div>
    );
  }

  const relevantCourses = COURSE_CATALOG.filter(course =>
    missingSkills.some(skill => 
      course.skillCategory.toLowerCase().includes(skill.toLowerCase()) ||
      course.relatedSkills.some(relatedSkill => 
        skill.toLowerCase().includes(relatedSkill.toLowerCase()) ||
        relatedSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relevantCourses.map(course => (
          <div
            key={course.id}
            data-testid="course-card"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.difficulty}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              <p className="mb-1"><span className="font-medium">Platform:</span> {course.platform}</p>
              <p><span className="font-medium">Duration:</span> {course.duration}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.relatedSkills.map((skill, index) => (
                <SkillPill key={index} name={skill} />
              ))}
            </div>
            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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