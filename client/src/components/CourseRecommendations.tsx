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
  },
  {
    id: '5',
    title: 'Office IT Systems Fundamentals',
    platform: 'LinkedIn Learning',
    duration: '4 weeks',
    skillCategory: 'Office IT Systems',
    description: 'Learn the fundamentals of office technology, including computers, printers, and basic troubleshooting techniques.',
    link: 'https://www.linkedin.com/learning/office-it-fundamentals',
    relatedSkills: ['Basic understanding of office IT systems', 'IT Troubleshooting'],
    difficulty: 'beginner'
  },
  {
    id: '6',
    title: 'Google Workspace Essentials',
    platform: 'Coursera',
    duration: '3 weeks',
    skillCategory: 'Google Suite',
    description: 'Master Google Workspace applications including Docs, Sheets, Slides, and Gmail for professional use.',
    link: 'https://www.coursera.org/google-workspace-essentials',
    relatedSkills: ['Basic proficiency in using Google Suite applications', 'Productivity Tools'],
    difficulty: 'beginner'
  },
  {
    id: '7',
    title: 'Cloud Storage and File Management',
    platform: 'Udemy',
    duration: '2 weeks',
    skillCategory: 'File Management',
    description: 'Learn effective file organization, naming conventions, and how to use cloud storage platforms like Google Drive, Dropbox, and OneDrive.',
    link: 'https://www.udemy.com/cloud-storage-essentials',
    relatedSkills: ['Knowledge of file management and cloud storage systems', 'Digital Organization'],
    difficulty: 'beginner'
  },
  {
    id: '8',
    title: 'Adapting to New Software Applications',
    platform: 'edX',
    duration: '4 weeks',
    skillCategory: 'Software Adaptability',
    description: 'Develop your ability to quickly learn and adapt to new software applications, with practical exercises across different software types.',
    link: 'https://www.edx.org/adapting-to-new-software',
    relatedSkills: ['Ability to learn new software applications quickly', 'Technology Adaptation'],
    difficulty: 'intermediate'
  },
  {
    id: '9',
    title: 'Cybersecurity Basics for Office Workers',
    platform: 'Coursera',
    duration: '3 weeks',
    skillCategory: 'Cybersecurity',
    description: 'Learn essential cybersecurity practices for the workplace, including password management, recognizing phishing attempts, and data protection.',
    link: 'https://www.coursera.org/cybersecurity-basics',
    relatedSkills: ['Basic understanding of cybersecurity best practices', 'Data Security'],
    difficulty: 'beginner'
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

  console.log('Missing skills received in CourseRecommendations:', missingSkills);

  // Improved matching algorithm for better phrase matching
  const relevantCourses = COURSE_CATALOG.filter(course => {
    // Check if any missing skill matches with course related skills
    return missingSkills.some(missingSkill => {
      const lowerMissingSkill = missingSkill.toLowerCase();
      
      // Check course skill category
      if (course.skillCategory.toLowerCase().includes(lowerMissingSkill)) {
        return true;
      }
      
      // Check each related skill
      return course.relatedSkills.some(relatedSkill => {
        const lowerRelatedSkill = relatedSkill.toLowerCase();
        // Check for partial matches in both directions
        return lowerRelatedSkill.includes(lowerMissingSkill) || 
               lowerMissingSkill.includes(lowerRelatedSkill);
      });
    });
  });

  console.log('Relevant courses found:', relevantCourses);

  // If we don't have at least 3 relevant courses, add some popular courses
  let displayCourses = [...relevantCourses];
  
  if (displayCourses.length < 3) {
    // Get courses not already in the relevantCourses list
    const additionalCourses = COURSE_CATALOG.filter(
      course => !displayCourses.some(rc => rc.id === course.id)
    );
    
    // Sort by most general/popular courses - here we're using beginner difficulty as a proxy
    additionalCourses.sort((a, b) => {
      // Sort by difficulty (beginner first)
      if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
      if (a.difficulty !== 'beginner' && b.difficulty === 'beginner') return 1;
      return 0;
    });
    
    // Add enough additional courses to have at least 3 total
    const neededCount = Math.max(0, 3 - displayCourses.length);
    displayCourses = [
      ...displayCourses,
      ...additionalCourses.slice(0, neededCount)
    ];
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Recommended Courses</h2>
      {displayCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCourses.map(course => (
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
      ) : (
        <p className="text-gray-500">No matching courses found for your skill gaps. Please check back later as we update our course catalog.</p>
      )}
    </div>
  );
};

export default CourseRecommendations; 