import React, { useState } from 'react';
import { RecommendationsList } from './RecommendationsList';
import CourseRecommendations from './CourseRecommendations';

interface Skill {
  name: string;
}

export interface User {
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

export interface CareerDashboardProps {
  user: User;
}

const SkillPill: React.FC<{ name: string }> = ({ name }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white mr-2 mb-2">
    {name}
    <button className="ml-2 text-white hover:text-gray-300">×</button>
  </span>
);

export const RoleCard: React.FC<{ title: string; subtitle?: string; skills: string[]; skillCount?: number }> = ({
  title,
  subtitle,
  skills,
  skillCount
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const visibleSkills = expanded ? skills : skills.slice(0, 2);
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
      <div className="mb-4">
        {visibleSkills.map((skill, index) => (
          <SkillPill key={index} name={skill} />
        ))}
        {skillCount && skillCount > 2 && !expanded && (
          <button 
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
          >
            + {skillCount - 2} more {title === 'Suggested Roles' ? 'roles' : 'skills'}
          </button>
        )}
        {expanded && skills.length > 2 && (
          <button 
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer block mt-2"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ user }) => {
  const currentSkills = user.skills || [];
  const suggestedRoles = user.resumeAnalysis?.suggestedRoles || [];
  const missingSkills = user.resumeAnalysis?.missingSkills || [];
  const recommendations = user.resumeAnalysis?.recommendations || [];
  
  console.log('CareerDashboard - user data:', user);
  console.log('CareerDashboard - recommendations:', recommendations);
  console.log('CareerDashboard - missingSkills:', missingSkills);
  console.log('CareerDashboard - resumeAnalysis exists:', !!user.resumeAnalysis);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Career Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          title="Current Role"
          subtitle={user.currentRole || "Not set"}
          skills={currentSkills}
          skillCount={currentSkills.length}
        />
        
        <RoleCard
          title="Target Role"
          subtitle={user.targetRole || "Not set"}
          skills={missingSkills}
          skillCount={missingSkills.length}
        />
        
        <RoleCard
          title="Suggested Roles"
          subtitle="Based on your skills"
          skills={suggestedRoles}
          skillCount={suggestedRoles.length}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm min-h-[300px] max-h-[800px] overflow-y-auto">
          {user.resumeAnalysis?.recommendations && user.resumeAnalysis.recommendations.length > 0 ? (
            <RecommendationsList recommendations={recommendations} />
          ) : (
            <div className="text-gray-500 italic">
              No recommendations available. Please complete your profile to get personalized recommendations.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-semibold mb-4">Recommended Courses</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {missingSkills.length > 0 ? (
            <CourseRecommendations missingSkills={missingSkills} />
          ) : (
            <div className="text-gray-500 italic">
              No courses available. Please complete your profile to get personalized course recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard; 