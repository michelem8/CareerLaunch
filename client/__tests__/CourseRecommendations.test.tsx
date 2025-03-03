import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import CourseRecommendations from '../components/CourseRecommendations';

describe('CourseRecommendations', () => {
  const mockMissingSkills = [
    'Core Programming Skills (Python, JavaScript)',
    'Data Structures and Algorithms',
    'Object-Oriented Programming'
  ];

  it('renders the component title', () => {
    render(<CourseRecommendations missingSkills={mockMissingSkills} />);
    expect(screen.getByText('Recommended Courses')).toBeInTheDocument();
  });

  it('displays course recommendations for each missing skill', () => {
    render(<CourseRecommendations missingSkills={mockMissingSkills} />);
    
    // Should show courses for Python/JavaScript
    expect(screen.getByText(/Python Programming Fundamentals/i)).toBeInTheDocument();
    expect(screen.getByText(/JavaScript Essentials/i)).toBeInTheDocument();
    
    // Should show courses for DSA
    expect(screen.getByText(/Data Structures and Algorithms/i)).toBeInTheDocument();
    
    // Should show courses for OOP
    expect(screen.getByText(/Object-Oriented Programming/i)).toBeInTheDocument();
  });

  it('displays course details including duration and platform', () => {
    render(<CourseRecommendations missingSkills={mockMissingSkills} />);
    
    const courseCards = screen.getAllByTestId('course-card');
    expect(courseCards.length).toBeGreaterThan(0);
    
    // Each course should have duration and platform information
    courseCards.forEach(card => {
      expect(card).toHaveTextContent(/Duration:/i);
      expect(card).toHaveTextContent(/Platform:/i);
    });
  });

  it('handles empty missing skills array', () => {
    render(<CourseRecommendations missingSkills={[]} />);
    expect(screen.getByText('No skill gaps identified')).toBeInTheDocument();
  });
}); 