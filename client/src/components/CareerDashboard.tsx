import React, { useState, useEffect, useMemo } from 'react';
import { RecommendationsList } from './RecommendationsList';
import CourseRecommendations from './CourseRecommendations';
import { generateCareerRecommendations } from '@/lib/ai-provider';
import { useQuery } from '@tanstack/react-query';

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
    experience: string[];
    education: string[];
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
  skills = [],
  skillCount
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const visibleSkills = expanded || !skills?.length ? skills : skills.slice(0, 2);
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
      <div className="mb-4">
        {Array.isArray(visibleSkills) && visibleSkills.map((skill, index) => (
          <SkillPill key={`${skill}-${index}`} name={skill} />
        ))}
        {Array.isArray(skills) && skills.length > 2 && !expanded && (
          <button 
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
          >
            + {skills.length - 2} more {title === 'Suggested Roles' ? 'roles' : 'skills'}
          </button>
        )}
        {expanded && Array.isArray(skills) && skills.length > 2 && (
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
  const isProduction = import.meta.env.MODE === 'production';
  
  // IMMEDIATE data validation/normalization - before any hooks
  if (!user.resumeAnalysis) {
    console.warn('CareerDashboard - IMMEDIATE FIX: resumeAnalysis is completely missing');
    user = {
      ...user,
      resumeAnalysis: {
        skills: user.skills || [],
        missingSkills: [],
        recommendations: [],
        suggestedRoles: [],
        experience: [],
        education: []
      }
    };
  } else {
    // Ensure all critical arrays exist
    if (!Array.isArray(user.resumeAnalysis.missingSkills)) {
      console.warn('CareerDashboard - IMMEDIATE FIX: missingSkills array is missing');
      user.resumeAnalysis.missingSkills = [];
    }
    if (!Array.isArray(user.resumeAnalysis.recommendations)) {
      console.warn('CareerDashboard - IMMEDIATE FIX: recommendations array is missing');
      user.resumeAnalysis.recommendations = [];
    }
  }
  
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Normalize user data to ensure resumeAnalysis always exists
  const normalizedUser = useMemo(() => {
    if (!user.resumeAnalysis) {
      console.log('CareerDashboard - Normalized missing resumeAnalysis to empty arrays');
      return {
        ...user,
        resumeAnalysis: {
          skills: [],
          experience: [],
          education: [],
          suggestedRoles: [],
          missingSkills: [],
          recommendations: []
        }
      };
    }
    return user;
  }, [user]);
  
  // Fetch AI-generated recommendations when the component mounts if we have missing skills
  useEffect(() => {
    const fetchAIRecommendations = async () => {
      if (!normalizedUser.resumeAnalysis.missingSkills || normalizedUser.resumeAnalysis.missingSkills.length === 0) {
        console.warn('No missing skills found, cannot fetch AI recommendations');
        setAiError('No missing skills identified');
        
        // In production, we'll set default recommendations if the API response fails
        if (isProduction) {
          setAiRecommendations([
            "Complete your career profile to get personalized recommendations",
            "Add your current skills in your profile settings",
            "Set your target role to see skill gaps",
            "Upload your resume for a comprehensive analysis"
          ]);
        }
        return;
      }
      
      setIsLoadingAi(true);
      setAiError(null);
      
      try {
        console.log('Fetching AI recommendations for missing skills:', normalizedUser.resumeAnalysis.missingSkills);
        
        // Add debugging info for API URL
        console.log('AI API URL:', `${import.meta.env.VITE_API_URL || ''}/api/ai/recommendations`);
        
        const result = await generateCareerRecommendations(normalizedUser.resumeAnalysis.missingSkills);
        console.log('AI recommendations result:', result);
        
        if (result.recommendations && result.recommendations.length > 0) {
          setAiRecommendations(result.recommendations);
        } else {
          console.warn('Received empty recommendations from AI API');
          setAiError('Received empty recommendations from AI');
        }
      } catch (error) {
        console.error('Error getting AI recommendations:', error);
        let errorMessage = 'Failed to get AI recommendations';
        
        if (error instanceof Error) {
          errorMessage = `${errorMessage}: ${error.message}`;
          console.error('Error details:', error.stack);
        }
        
        setAiError(errorMessage);
        
        // Fallback to stored recommendations in case of error
        if (normalizedUser.resumeAnalysis?.recommendations && normalizedUser.resumeAnalysis.recommendations.length > 0) {
          console.log('Using stored recommendations as fallback');
          setAiRecommendations(normalizedUser.resumeAnalysis.recommendations);
        }
      }
      setIsLoadingAi(false);
    };
    
    fetchAIRecommendations();
  }, [normalizedUser.resumeAnalysis?.missingSkills, isProduction]);
  
  // Only use fallback data in development, never in production
  if (!normalizedUser.resumeAnalysis && !isProduction) {
    console.warn('CareerDashboard - resumeAnalysis is missing, creating fallback data (development only)');
    normalizedUser.resumeAnalysis = {
      skills: normalizedUser.skills || [],
      missingSkills: [
        "Technical Leadership",
        "Team Management",
        "Strategic Planning",
        "Stakeholder Communication"
      ],
      recommendations: [
        "Take a leadership course focused on technical teams",
        "Practice delegating technical tasks while maintaining oversight",
        "Develop stronger architecture and system design knowledge",
        "Work on communication skills for technical and non-technical audiences"
      ],
      suggestedRoles: ["Engineering Manager", "Technical Lead", "Product Manager"],
      experience: [],
      education: []
    };
  }

  // In development: ensure all required arrays exist in resumeAnalysis
  if (normalizedUser.resumeAnalysis && !isProduction) {
    if (!Array.isArray(normalizedUser.resumeAnalysis.missingSkills)) {
      console.warn('CareerDashboard - missingSkills is not an array, creating fallback (development only)');
      normalizedUser.resumeAnalysis.missingSkills = [
        "Technical Leadership",
        "Team Management", 
        "Strategic Planning",
        "Stakeholder Communication"
      ];
    }
    
    if (!Array.isArray(normalizedUser.resumeAnalysis.recommendations)) {
      console.warn('CareerDashboard - recommendations is not an array, creating fallback (development only)');
      normalizedUser.resumeAnalysis.recommendations = [
        "Take a leadership course focused on technical teams",
        "Practice delegating technical tasks while maintaining oversight",
        "Develop stronger architecture and system design knowledge",
        "Work on communication skills for technical and non-technical audiences"
      ];
    }
    
    if (!Array.isArray(normalizedUser.resumeAnalysis.suggestedRoles)) {
      console.warn('CareerDashboard - suggestedRoles is not an array, creating fallback (development only)');
      normalizedUser.resumeAnalysis.suggestedRoles = ["Engineering Manager", "Technical Lead", "Product Manager"];
    }
  }

  const currentSkills = normalizedUser.skills || [];
  // In production, use potentially empty arrays to show proper empty states
  const suggestedRoles = normalizedUser.resumeAnalysis?.suggestedRoles || [];
  const missingSkills = normalizedUser.resumeAnalysis?.missingSkills || [];
  
  // Use AI recommendations if available, otherwise fall back to stored recommendations
  const recommendations = aiRecommendations.length > 0 
    ? aiRecommendations 
    : (normalizedUser.resumeAnalysis?.recommendations || []);

  // Add more detailed logging
  console.log('CareerDashboard - Environment:', import.meta.env.MODE);
  console.log('CareerDashboard - Is Production:', isProduction);
  console.log('CareerDashboard - user data:', JSON.stringify(normalizedUser, null, 2));
  console.log('CareerDashboard - current skills:', currentSkills);
  console.log('CareerDashboard - AI recommendations:', aiRecommendations);
  console.log('CareerDashboard - stored recommendations:', normalizedUser.resumeAnalysis?.recommendations);
  console.log('CareerDashboard - final recommendations shown:', recommendations);
  console.log('CareerDashboard - missingSkills:', missingSkills);
  console.log('CareerDashboard - suggestedRoles:', suggestedRoles);
  console.log('CareerDashboard - API URL:', import.meta.env.VITE_API_URL);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Career Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          title="Current Role"
          subtitle={normalizedUser.currentRole || "Not set"}
          skills={currentSkills}
          skillCount={currentSkills.length}
        />
        
        <RoleCard
          title="Target Role"
          subtitle={normalizedUser.targetRole || "Not set"}
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
        <h2 className="text-2xl font-semibold mb-4">
          AI-Powered Recommendations
          {isProduction && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              AI Enhanced
            </span>
          )}
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm min-h-[300px] max-h-[800px] overflow-y-auto">
          {isLoadingAi ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-600">Generating personalized AI recommendations...</p>
            </div>
          ) : aiError && !recommendations.length ? (
            <div className="text-center p-4">
              <p className="text-gray-700 font-medium mb-3">
                {aiError === 'No missing skills identified' 
                  ? 'No skill gaps were identified for your career path' 
                  : `Could not load AI recommendations: ${aiError}`}
              </p>
              <div className="mt-2 text-gray-600 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-3">To get personalized recommendations:</h3>
                <ol className="list-decimal text-left pl-5 space-y-2">
                  <li>Ensure your <strong>target role</strong> is set correctly in your profile</li>
                  <li>Add or update your <strong>current skills</strong> in your profile</li>
                  <li>Upload an updated <strong>resume</strong> for detailed analysis</li>
                  <li>Complete the <strong>career assessment</strong> if you haven't already</li>
                </ol>
                <div className="mt-6">
                  <a 
                    href="/profile"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update Profile
                  </a>
                </div>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <RecommendationsList recommendations={recommendations} />
          ) : (
            <div className="text-gray-500 italic">
              {isProduction ? 
                "No recommendations available. To get personalized recommendations, please ensure you have completed the survey with your current skills and target role." : 
                "No recommendations available. Please complete your profile to get personalized recommendations."}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {missingSkills.length > 0 ? (
            <CourseRecommendations missingSkills={missingSkills} />
          ) : (
            <div className="text-gray-500 italic">
              {isProduction ?
                "No skill gaps identified. To get course recommendations, please ensure you have completed the survey with your current skills and target role." :
                "No courses available. Please complete your profile to get personalized course recommendations."}
            </div>
          )}
        </div>
      </div>
      
      {isProduction && (!normalizedUser.resumeAnalysis || 
                       !recommendations.length || 
                       !missingSkills.length) && (
        <div className="mt-8 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Complete Setup to See Recommendations</h3>
          <p className="mb-4">
            To get personalized career recommendations and skill gap analysis, make sure to:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Finish the onboarding survey with your current and target roles</li>
            <li>Add your skills in your profile</li>
            <li>Upload your resume for more accurate analysis (optional)</li>
          </ol>
          <div className="mt-4">
            <a 
              href="/survey"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Complete Your Profile
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerDashboard; 