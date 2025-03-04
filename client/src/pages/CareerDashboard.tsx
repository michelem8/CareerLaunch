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
      const response = await apiRequest('GET', '/api/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">No user data found. Please complete the survey.</p>
        </div>
      </div>
    );
  }

  return <CareerDashboardComponent user={user} />;
};

export default CareerDashboard; 