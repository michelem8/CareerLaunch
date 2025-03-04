import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseRecommendations from '../CourseRecommendations';

describe('CourseRecommendations', () => {
  test('displays message when no missing skills are provided', () => {
    render(<CourseRecommendations missingSkills={[]} />);
    
    expect(screen.getByText('No skill gaps identified')).toBeInTheDocument();
    expect(screen.queryByTestId('course-card')).not.toBeInTheDocument();
  });

  test('displays relevant courses when matching missing skills are provided', () => {
    const missingSkills = ['Basic understanding of office IT systems'];
    
    render(<CourseRecommendations missingSkills={missingSkills} />);
    
    expect(screen.getByText('Office IT Systems Fundamentals')).toBeInTheDocument();
    expect(screen.getAllByTestId('course-card').length).toBeGreaterThanOrEqual(3);
  });

  test('displays multiple relevant courses for multiple missing skills', () => {
    const missingSkills = [
      'Basic understanding of office IT systems',
      'Basic understanding of cybersecurity best practices'
    ];
    
    render(<CourseRecommendations missingSkills={missingSkills} />);
    
    expect(screen.getByText('Office IT Systems Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Cybersecurity Basics for Office Workers')).toBeInTheDocument();
    expect(screen.getAllByTestId('course-card').length).toBeGreaterThanOrEqual(3);
  });

  test('displays at least 3 recommended courses even with non-matching skills', () => {
    const missingSkills = ['Skill that does not exist in catalog'];
    
    render(<CourseRecommendations missingSkills={missingSkills} />);
    
    // Should display at least 3 courses regardless of no direct matches
    const courseCards = screen.getAllByTestId('course-card');
    expect(courseCards.length).toBeGreaterThanOrEqual(3);
  });

  test('displays at least 3 recommended courses even with minimal missing skills', () => {
    const missingSkills = ['JavaScript']; // Just one skill that matches one course
    
    render(<CourseRecommendations missingSkills={missingSkills} />);
    
    const courseCards = screen.getAllByTestId('course-card');
    expect(courseCards.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('JavaScript Essentials')).toBeInTheDocument();
  });
}); 