import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CareerDashboard from '../src/pages/CareerDashboard';

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
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
        },
        preferences: {
          preferredIndustries: ["enterprise-software", "ai-ml"],
          learningStyles: ["practical", "self-paced"],
          timeCommitment: "4-8"
        }
      })
    })
  )
}));

describe('User Profile Data Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('displays user role information', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CareerDashboard />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
    });

    // Check if roles are displayed
    await waitFor(() => {
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
      expect(screen.getByText('Engineering Manager')).toBeInTheDocument();
    });
  });

  it('displays recommendations from resume analysis', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CareerDashboard />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
    });
    
    // Check if recommendations are displayed
    await waitFor(() => {
      expect(screen.getByText('Focus on team building and leadership skills')).toBeInTheDocument();
      expect(screen.getByText('Develop deeper technical architecture knowledge')).toBeInTheDocument();
      expect(screen.getByText('Practice making technical decisions at scale')).toBeInTheDocument();
    });
  });

  it('displays missing skills from resume analysis', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CareerDashboard />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
    });
    
    // Check if missing skills are displayed
    await waitFor(() => {
      expect(screen.getByText('Engineering Leadership')).toBeInTheDocument();
      expect(screen.getByText('Team Building')).toBeInTheDocument();
      expect(screen.getByText('Technical Architecture')).toBeInTheDocument();
      expect(screen.getByText('Cross-functional Communication')).toBeInTheDocument();
    });
  });
}); 