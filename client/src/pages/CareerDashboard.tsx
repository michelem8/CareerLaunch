import React from 'react';
import { useQuery } from '@tanstack/react-query';
import CareerDashboardComponent from '../components/CareerDashboard';
import { apiRequest } from '@/lib/queryClient';

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

const CareerDashboard: React.FC = () => {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      // Add retry logic for production environment
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Fetching user data (attempt ${attempts + 1}/${maxAttempts})`);
          const response = await apiRequest('GET', '/api/users/me');
          
          if (!response.ok) {
            console.error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
            const responseText = await response.text();
            console.error('Response body:', responseText);
            throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('User data fetched successfully:', data);
          
          // Add detailed debugging for resumeAnalysis
          console.log('resumeAnalysis check:', {
            exists: !!data.resumeAnalysis,
            isProduction: import.meta.env.PROD,
            environment: import.meta.env.MODE,
            missingSkills: data.resumeAnalysis?.missingSkills?.length || 0,
            recommendations: data.resumeAnalysis?.recommendations?.length || 0
          });
          
          // Ensure resumeAnalysis is fully initialized - NO MATTER WHAT
          // This is a defensive approach to prevent issues in production
          if (!data.resumeAnalysis) {
            console.warn('Missing resumeAnalysis in user data - creating it');
            data.resumeAnalysis = {
              skills: [],
              experience: [],
              education: [],
              suggestedRoles: [],
              missingSkills: [],
              recommendations: []
            };
          } else {
            // Ensure all required properties exist
            if (!Array.isArray(data.resumeAnalysis.skills)) {
              console.warn('Fixing missing skills array in resumeAnalysis');
              data.resumeAnalysis.skills = data.skills || [];
            }
            if (!Array.isArray(data.resumeAnalysis.missingSkills)) {
              console.warn('Fixing missing missingSkills array in resumeAnalysis');
              data.resumeAnalysis.missingSkills = [];
            }
            if (!Array.isArray(data.resumeAnalysis.recommendations)) {
              console.warn('Fixing missing recommendations array in resumeAnalysis');
              data.resumeAnalysis.recommendations = [];
            }
            if (!Array.isArray(data.resumeAnalysis.suggestedRoles)) {
              console.warn('Fixing missing suggestedRoles array in resumeAnalysis');
              data.resumeAnalysis.suggestedRoles = [];
            }
            if (!Array.isArray(data.resumeAnalysis.experience)) {
              console.warn('Fixing missing experience array in resumeAnalysis');
              data.resumeAnalysis.experience = [];
            }
            if (!Array.isArray(data.resumeAnalysis.education)) {
              console.warn('Fixing missing education array in resumeAnalysis');
              data.resumeAnalysis.education = [];
            }
          }
          
          // Add post-processing validation
          console.log('After fixes, resumeAnalysis status:', {
            exists: !!data.resumeAnalysis,
            missingSkills: data.resumeAnalysis?.missingSkills?.length || 0,
            recommendations: data.resumeAnalysis?.recommendations?.length || 0,
            allArraysExist: !!(
              Array.isArray(data.resumeAnalysis?.skills) &&
              Array.isArray(data.resumeAnalysis?.missingSkills) &&
              Array.isArray(data.resumeAnalysis?.recommendations) &&
              Array.isArray(data.resumeAnalysis?.suggestedRoles) &&
              Array.isArray(data.resumeAnalysis?.experience) &&
              Array.isArray(data.resumeAnalysis?.education)
            )
          });
          
          return data;
        } catch (err) {
          console.error(`Error in attempt ${attempts + 1}:`, err);
          attempts++;
          
          if (attempts >= maxAttempts) {
            throw err;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      throw new Error('Failed to fetch user data after multiple attempts');
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in CareerDashboard:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading dashboard data. Please try again.</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">No user data found. Please complete the survey.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/career-survey'}
          >
            Start Survey
          </button>
        </div>
      </div>
    );
  }

  return <CareerDashboardComponent user={user} />;
};

export default CareerDashboard; 