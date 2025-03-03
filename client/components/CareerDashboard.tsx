import React from 'react';
import CourseRecommendations from './CourseRecommendations';

interface Skill {
  name: string;
}

interface Role {
  title: string;
  description?: string;
  skills: Skill[];
  skillCount?: number;
  missingSkills?: string[];
}

interface CareerDashboardProps {
  currentRole: Role;
  targetRole: Role;
  suggestedRole: Role;
}

const SkillPill: React.FC<{ name: string; roleType: 'current' | 'target' | 'suggested' }> = ({ name, roleType }) => (
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
  <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100 hover:border-blue-200 transition-colors duration-200">
    <h2 className="text-2xl font-semibold mb-2 text-blue-900">{title}</h2>
    {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
    <div className="mb-4">
      {skills.slice(0, 2).map((skill, index) => (
        <SkillPill 
          key={index} 
          name={skill.name} 
          roleType={title === 'Target Role' ? 'target' : title === 'Current Role' ? 'current' : 'suggested'} 
        />
      ))}
      {skillCount && <span className="text-gray-600 text-sm">+ {skillCount} {title === 'Suggested Role' ? 'roles' : 'skills'}</span>}
    </div>
  </div>
);

const CareerDashboard: React.FC<CareerDashboardProps> = ({ currentRole, targetRole, suggestedRole }) => {
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
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-gray-600">
            Based on your career transition goals, we've identified key skills to develop. Check out the recommended courses below to start building these skills.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <CourseRecommendations missingSkills={targetRole.missingSkills || []} />
      </div>
    </div>
  );
};

export default CareerDashboard; 