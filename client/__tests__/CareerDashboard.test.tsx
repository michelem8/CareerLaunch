import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CareerDashboard, User, CareerDashboardProps } from '../src/components/CareerDashboard';

// Mock user data
const mockUserData: User = {
  currentRole: 'Senior Product Manager',
  targetRole: 'Software Engineer',
  skills: ['Product Strategy', 'User Research'],
  resumeAnalysis: {
    skills: ['Product Strategy', 'User Research'],
    missingSkills: ['Core Programming Skills', 'Data Structures and Algorithms'],
    recommendations: ['Focus on learning programming fundamentals'],
    suggestedRoles: ['Technical Product Manager', 'Engineering Manager']
  }
};

// Mock fetch
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockUserData),
  })
));

describe('CareerDashboard', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  it('renders the dashboard title', async () => {
    render(<CareerDashboard user={mockUserData} />);
    expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
  });

  it('displays all three role sections', async () => {
    render(<CareerDashboard user={mockUserData} />);
    expect(screen.getByText('Current Role')).toBeInTheDocument();
    expect(screen.getByText('Target Role')).toBeInTheDocument();
    expect(screen.getByText('Suggested Roles')).toBeInTheDocument();
  });

  it('fetches and displays user data', async () => {
    render(<CareerDashboard user={mockUserData} />);
    expect(fetch).toHaveBeenCalledWith('/api/users/me');
  });

  const mockUser: User = {
    currentRole: 'Software Developer',
    targetRole: 'Senior Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js'],
    resumeAnalysis: {
      recommendations: [
        'Learn system design principles',
        'Study distributed systems',
        'Develop leadership skills'
      ],
      suggestedRoles: ['Tech Lead', 'Senior Backend Engineer'],
      skills: ['JavaScript', 'React', 'Node.js'],
      missingSkills: ['System Design', 'Distributed Systems', 'Leadership']
    }
  };

  it('displays recommendations from resume analysis', () => {
    const props: CareerDashboardProps = { user: mockUser };
    render(<CareerDashboard {...props} />);
    
    // Check if recommendations from resume analysis are displayed
    mockUser.resumeAnalysis?.recommendations?.forEach(recommendation => {
      expect(screen.getByText(recommendation)).toBeInTheDocument();
    });
  });

  it('handles missing recommendations gracefully', () => {
    const userWithoutRecommendations: User = {
      ...mockUser,
      resumeAnalysis: {
        skills: mockUser.resumeAnalysis!.skills,
        missingSkills: mockUser.resumeAnalysis!.missingSkills,
        recommendations: [],
        suggestedRoles: mockUser.resumeAnalysis!.suggestedRoles
      }
    };
    
    const props: CareerDashboardProps = { user: userWithoutRecommendations };
    render(<CareerDashboard {...props} />);
    const recommendationsSection = screen.getByRole('heading', { name: /recommendations/i }).parentElement;
    expect(recommendationsSection).toBeInTheDocument();
  });
});

describe('CareerDashboard with Recommendations', () => {
  // Mock user with recommendations
  const mockUserWithRecommendations: User = {
    currentRole: 'Software Developer',
    targetRole: 'Senior Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js'],
    resumeAnalysis: {
      recommendations: [
        'Learn system design principles',
        'Study distributed systems',
        'Develop leadership skills'
      ],
      suggestedRoles: ['Tech Lead', 'Senior Backend Engineer'],
      skills: ['JavaScript', 'React', 'Node.js'],
      missingSkills: ['System Design', 'Distributed Systems', 'Leadership']
    }
  };

  // Mock user without recommendations
  const mockUserWithoutRecommendations: User = {
    currentRole: 'Software Developer',
    targetRole: 'Senior Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js'],
    resumeAnalysis: {
      recommendations: [],
      suggestedRoles: ['Tech Lead', 'Senior Backend Engineer'],
      skills: ['JavaScript', 'React', 'Node.js'],
      missingSkills: ['System Design', 'Distributed Systems', 'Leadership']
    }
  };

  it('displays recommendations when available', () => {
    const props: CareerDashboardProps = { user: mockUserWithRecommendations };
    render(<CareerDashboard {...props} />);
    
    // Check if the recommendations section exists
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    
    // Check if all recommendations are displayed
    mockUserWithRecommendations.resumeAnalysis?.recommendations.forEach(recommendation => {
      expect(screen.getByText(recommendation)).toBeInTheDocument();
    });
  });

  it('displays a message when no recommendations are available', () => {
    const props: CareerDashboardProps = { user: mockUserWithoutRecommendations };
    render(<CareerDashboard {...props} />);
    
    // Check if the recommendations section exists
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    
    // Check if the no-recommendations message is displayed
    expect(screen.getByText('No recommendations available. Please complete your profile to get personalized recommendations.')).toBeInTheDocument();
  });
}); 