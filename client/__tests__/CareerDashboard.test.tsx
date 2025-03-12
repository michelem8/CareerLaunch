import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CareerDashboard from '../src/pages/CareerDashboard';
import { apiRequest } from '../src/lib/queryClient';

// Mock the API request function
vi.mock('../src/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('CareerDashboard Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Reset mock implementations
    vi.resetAllMocks();
  });

  it('displays user data when API request succeeds', async () => {
    // Mock successful API response
    const mockUserData = {
      id: 1,
      username: "demo_user",
      currentRole: "Product Manager",
      targetRole: "Engineering Manager",
      skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
      hasCompletedSurvey: true,
      resumeAnalysis: {
        skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
        experience: [
          "Senior Product Manager at Tech Company (2018-2023)",
          "Product Manager at Software Inc (2015-2018)"
        ],
        education: [
          "MBA, Business School (2015)",
          "BS Computer Science, University (2012)"
        ],
        missingSkills: [
          "Engineering Leadership",
          "Team Building", 
          "Technical Architecture",
          "Cross-functional Communication"
        ],
        recommendations: [
          "Focus on team building and leadership skills",
          "Develop deeper technical architecture knowledge",
          "Practice making technical decisions at scale"
        ],
        suggestedRoles: ["Technical Product Manager", "Engineering Manager", "Development Team Lead"]
      }
    };
    
    // Mock the API request to return a successful response
    vi.mocked(apiRequest).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserData),
      status: 200,
      statusText: 'OK'
    } as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <CareerDashboard />
      </QueryClientProvider>
    );
    
    // Verify loading state is shown initially
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
    
    // Wait for data to load and component to update
    await waitFor(() => {
      expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
    });
    
    // Verify API was called correctly
    expect(apiRequest).toHaveBeenCalledWith('GET', '/api/users/me');
    
    // Verify user data is displayed
    await waitFor(() => {
      // Check if current role is displayed
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
      
      // Check if target role is displayed
      expect(screen.getByText('Engineering Manager')).toBeInTheDocument();
      
      // Check if recommended skills are displayed
      expect(screen.getByText('Engineering Leadership')).toBeInTheDocument();
      expect(screen.getByText('Team Building')).toBeInTheDocument();
      
      // Check if suggested roles are displayed
      expect(screen.getByText('Technical Product Manager')).toBeInTheDocument();
      
      // Check if recommendations are displayed
      expect(screen.getByText('Focus on team building and leadership skills')).toBeInTheDocument();
      expect(screen.getByText('Develop deeper technical architecture knowledge')).toBeInTheDocument();
    });
  });

  it('displays error message when API request fails', async () => {
    // Mock failed API response
    vi.mocked(apiRequest).mockRejectedValue(new Error('Network error'));

    render(
      <QueryClientProvider client={queryClient}>
        <CareerDashboard />
      </QueryClientProvider>
    );
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Error loading dashboard data. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays the "no user data" message when API returns null', async () => {
    // Mock empty API response
    vi.mocked(apiRequest).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
      status: 200,
      statusText: 'OK'
    } as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <CareerDashboard />
      </QueryClientProvider>
    );
    
    // Verify no user data message is displayed
    await waitFor(() => {
      expect(screen.getByText('No user data found. Please complete the survey.')).toBeInTheDocument();
      expect(screen.getByText('Start Survey')).toBeInTheDocument();
    });
  });
}); 