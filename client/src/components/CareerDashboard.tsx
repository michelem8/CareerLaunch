import React from 'react';
import { RecommendationsList } from './RecommendationsList';

interface Skill {
  name: string;
}

interface User {
  resumeAnalysis?: {
    recommendations?: string[];
  };
}

interface CareerDashboardProps {
  currentRole: {
    title: string;
    skills: Skill[];
  };
  targetRole: {
    title: string;
    skills: Skill[];
  };
  suggestedRole: {
    title: string;
    skills: Skill[];
  };
  user?: User;
}

const SkillPill: React.FC<{ name: string }> = ({ name }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white mr-2 mb-2">
    {name}
    <button className="ml-2 text-white hover:text-gray-300">×</button>
  </span>
);

const RoleCard: React.FC<{ title: string; subtitle?: string; skills: Skill[]; skillCount?: number }> = ({
  title,
  subtitle,
  skills,
  skillCount
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <h2 className="text-2xl font-semibold mb-2">{title}</h2>
    {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
    <div className="mb-4">
      {skills.slice(0, 2).map((skill, index) => (
        <SkillPill key={index} name={skill.name} />
      ))}
      {skillCount && <span className="text-gray-600 text-sm">+ {skillCount} {title === 'Suggested Role' ? 'roles' : 'skills'}</span>}
    </div>
  </div>
);

const CareerDashboard: React.FC<CareerDashboardProps> = ({ 
  currentRole, 
  targetRole, 
  suggestedRole,
  user
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Career Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          title="Current Role"
          subtitle={currentRole.title}
          skills={currentRole.skills}
          skillCount={17}
        />
        
        <RoleCard
          title="Target Role"
          subtitle={targetRole.title}
          skills={targetRole.skills}
          skillCount={10}
        />
        
        <RoleCard
          title="Suggested Role"
          subtitle="Based on your skills"
          skills={suggestedRole.skills}
          skillCount={10}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm min-h-[600px] max-h-[800px] overflow-y-auto">
          <RecommendationsList 
            recommendations={user?.resumeAnalysis?.recommendations ?? [
              "Focus on developing your system design skills through practical projects",
              "Take advanced courses in distributed systems and scalability",
              "Build experience with cloud platforms like AWS or Azure",
              "Practice leadership skills by mentoring junior developers",
              "Contribute to open-source projects to demonstrate expertise",
              "Develop communication skills through technical presentations",
              "Stay updated with latest industry trends and technologies"
            ]} 
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recommended Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((course) => (
            <div key={course} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Course {course}</h3>
                <p className="text-gray-600 mb-4">Course description</p>
                <div className="flex flex-wrap gap-2">
                  <SkillPill name="Skill" />
                  <SkillPill name="Skill" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard; 