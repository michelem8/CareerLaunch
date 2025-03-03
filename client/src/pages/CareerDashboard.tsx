import React, { useEffect, useState } from 'react';
import CourseRecommendations from '../components/CourseRecommendations';

interface SkillTag {
  name: string;
}

interface User {
  currentRole: string | null;
  targetRole: string | null;
  skills: string[];
  resumeAnalysis?: {
    skills: string[];
    missingSkills: string[];
    recommendations: string[];
    suggestedRoles: string[];
  };
}

interface RoleCard {
  title: string;
  subtitle: string;
  skills: SkillTag[];
  extraText?: string;
  missingSkills?: string[];
  showSkills?: boolean;
}

const SkillTag: React.FC<{ name: string; isMissing?: boolean }> = ({ name, isMissing = false }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-800 text-white">
    {name}
    <button className="ml-1.5 text-white hover:text-gray-300">×</button>
  </span>
);

export const RoleCard: React.FC<RoleCard> = ({ title, subtitle, skills, extraText, missingSkills, showSkills = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialSkillsToShow = 2;
  
  const displayedSkills = isExpanded 
    ? skills 
    : skills.slice(0, initialSkillsToShow);
  
  const displayedMissingSkills = isExpanded 
    ? missingSkills 
    : missingSkills?.slice(0, initialSkillsToShow);
  
  const remainingSkillsCount = skills.length - initialSkillsToShow;
  const remainingMissingSkillsCount = missingSkills 
    ? missingSkills.length - initialSkillsToShow 
    : 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-lg text-gray-700 mb-4">{subtitle}</p>
      <div>
        {showSkills && (
          <>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {title === "Suggested Role" ? "Roles" : "Skills"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {displayedSkills.map((skill, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    title === "Suggested Role"
                      ? "bg-white text-black border border-black"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  {skill.name}
                </span>
              ))}
              {!isExpanded && remainingSkillsCount > 0 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
                >
                  + {remainingSkillsCount} more {title === "Suggested Role" ? "roles" : "skills"}
                </button>
              )}
            </div>
          </>
        )}
        {missingSkills && missingSkills.length > 0 && (
          <div className={`${showSkills ? 'mt-4' : ''}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Missing Skills</h3>
            <div className="flex flex-wrap gap-2">
              {displayedMissingSkills?.map((skill, index) => (
                <SkillTag key={index} name={skill} isMissing={true} />
              ))}
              {!isExpanded && remainingMissingSkillsCount > 0 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
                >
                  + {remainingMissingSkillsCount} more skills
                </button>
              )}
            </div>
          </div>
        )}
        {isExpanded && (remainingSkillsCount > 0 || remainingMissingSkillsCount > 0) && (
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

const CareerDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const currentRole: RoleCard = {
    title: "Current Role",
    subtitle: user?.currentRole || "Not specified",
    skills: [
      ...(user?.skills || []),
      ...(user?.resumeAnalysis?.skills || [])
    ].map(skill => ({ name: skill })),
    extraText: undefined,
    showSkills: true
  };

  const targetRole: RoleCard = {
    title: "Target Role",
    subtitle: user?.targetRole ? user.targetRole : "Please complete your profile to set your target role",
    skills: [],
    showSkills: false,
    missingSkills: user?.resumeAnalysis?.missingSkills || []
  };

  const suggestedRole: RoleCard = {
    title: "Suggested Role",
    subtitle: "Based on your current skills",
    skills: (user?.resumeAnalysis?.suggestedRoles || []).map(role => ({ name: role })),
    extraText: undefined,
    showSkills: true
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-8">Your Career Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <RoleCard {...currentRole} />
        <RoleCard {...targetRole} />
        <RoleCard {...suggestedRole} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        {user?.resumeAnalysis?.recommendations ? (
          <ul className="space-y-4 list-disc pl-5">
            {user.resumeAnalysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-600">
                {recommendation}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">
            Complete your profile to get personalized recommendations.
          </p>
        )}
      </div>

      <div>
        <CourseRecommendations missingSkills={user?.resumeAnalysis?.missingSkills || []} />
      </div>
    </div>
  );
};

export default CareerDashboard; 