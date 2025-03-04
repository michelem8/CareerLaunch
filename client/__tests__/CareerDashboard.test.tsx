import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CareerDashboard from '../src/pages/CareerDashboard';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      currentRole: 'Senior Product Manager',
      targetRole: 'Software Engineer',
      skills: ['Product Strategy', 'User Research'],
      resumeAnalysis: {
        skills: ['Product Strategy', 'User Research'],
        missingSkills: ['Core Programming Skills', 'Data Structures and Algorithms'],
        recommendations: ['Focus on learning programming fundamentals'],
        suggestedRoles: ['Technical Product Manager', 'Engineering Manager']
      }
    }),
  })
) as jest.Mock;

describe('CareerDashboard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the dashboard title', async () => {
    render(<CareerDashboard />);
    expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
  });

  it('displays all three role sections', async () => {
    render(<CareerDashboard />);
    expect(screen.getByText('Current Role')).toBeInTheDocument();
    expect(screen.getByText('Target Role')).toBeInTheDocument();
    expect(screen.getByText('Suggested Role')).toBeInTheDocument();
  });

  it('fetches and displays user data', async () => {
    render(<CareerDashboard />);
    expect(global.fetch).toHaveBeenCalledWith('/api/users/me');
  });
}); 