import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CareerDashboard from '../components/CareerDashboard';

const mockData = {
  currentRole: {
    title: 'Senior Product Manager',
    skills: [
      { name: 'Product Strategy' },
      { name: 'User Research' },
    ],
  },
  targetRole: {
    title: 'Software Engineer',
    skills: [
      { name: 'Python' },
      { name: 'JavaScript' },
    ],
  },
  suggestedRole: {
    title: 'Technical Product Manager',
    skills: [
      { name: 'API Design' },
      { name: 'System Architecture' },
    ],
  },
};

describe('CareerDashboard', () => {
  it('renders the dashboard title', () => {
    render(<CareerDashboard {...mockData} />);
    expect(screen.getByText('Your Career Dashboard')).toBeInTheDocument();
  });

  it('displays all three role sections', () => {
    render(<CareerDashboard {...mockData} />);
    expect(screen.getByText('Current Role')).toBeInTheDocument();
    expect(screen.getByText('Target Role')).toBeInTheDocument();
    expect(screen.getByText('Suggested Role')).toBeInTheDocument();
  });

  it('shows role titles correctly', () => {
    render(<CareerDashboard {...mockData} />);
    expect(screen.getByText('Senior Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Based on your skills')).toBeInTheDocument();
  });

  it('displays skills for each role', () => {
    render(<CareerDashboard {...mockData} />);
    expect(screen.getByText('Product Strategy')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('API Design')).toBeInTheDocument();
  });

  it('shows recommendations section', () => {
    render(<CareerDashboard {...mockData} />);
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  it('shows recommended courses section', () => {
    render(<CareerDashboard {...mockData} />);
    expect(screen.getByText('Recommended Courses')).toBeInTheDocument();
    expect(screen.getAllByText('Course description')).toHaveLength(3);
  });
}); 