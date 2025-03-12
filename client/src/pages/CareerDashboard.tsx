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