/// <reference types="vitest" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseRecommendations from '../CourseRecommendations';
import { vi, type Mock } from 'vitest';
import { renderWithClient } from '../../test/utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { apiRequest } from '../../../src/lib/queryClient';

// Mock apiRequest
vi.mock('../../../src/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('CourseRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays courses from API', async () => {
    const mockApiCourses = [
      {
        id: '1',
        title: 'API Course 1',
        description: 'Test course from API',
        platform: 'Coursera',
        difficulty: 'Beginner',
        duration: '4-8 weeks',
        skills: ['Programming'],
        url: 'https://example.com/course1',
      }
    ];

    (apiRequest as Mock).mockResolvedValueOnce(mockApiCourses);

    renderWithClient(<CourseRecommendations missingSkills={['Programming']} />);
    
    // Should show loading state initially
    expect(screen.getByText('Analyzing your profile and generating personalized recommendations...')).toBeInTheDocument();
    
    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getByText('API Course 1')).toBeInTheDocument();
    });

    // Verify API was called
    expect(apiRequest).toHaveBeenCalledWith('GET', '/api/courses/recommended?skills=Programming');
  });

  it('handles API error gracefully', async () => {
    (apiRequest as Mock).mockRejectedValueOnce(new Error('Failed to fetch course recommendations'));

    renderWithClient(<CourseRecommendations missingSkills={['Programming']} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch course recommendations')).toBeInTheDocument();
    });
  });

  it('displays no courses message when API returns empty array', async () => {
    (apiRequest as Mock).mockResolvedValueOnce([]);

    renderWithClient(<CourseRecommendations missingSkills={['Programming']} />);

    await waitFor(() => {
      expect(screen.getByText('No courses available for your skill gaps. Please check back later.')).toBeInTheDocument();
    });
  });

  it('displays message when no missing skills are provided', () => {
    renderWithClient(<CourseRecommendations missingSkills={[]} />);
    
    expect(screen.getByText('No skill gaps identified')).toBeInTheDocument();
    expect(screen.queryByTestId('course-card')).not.toBeInTheDocument();
  });

  it('displays loading state when fetching courses', async () => {
    (apiRequest as Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    renderWithClient(<CourseRecommendations missingSkills={['Programming']} />);
    
    expect(screen.getByText('Analyzing your profile and generating personalized recommendations...')).toBeInTheDocument();
  });

  it('displays error state when API returns non-ok response', async () => {
    (apiRequest as Mock).mockRejectedValueOnce(new Error('Failed to fetch course recommendations'));

    renderWithClient(<CourseRecommendations missingSkills={['Programming']} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch course recommendations')).toBeInTheDocument();
    });
  });

  it('does not fetch courses when no missing skills are provided', async () => {
    renderWithClient(<CourseRecommendations missingSkills={[]} />);
    
    expect(apiRequest).not.toHaveBeenCalled();
    expect(screen.getByText('No skill gaps identified')).toBeInTheDocument();
  });

  it('displays multiple courses from API', async () => {
    const mockApiCourses = [
      {
        id: '1',
        title: 'Course 1',
        description: 'Description 1',
        platform: 'Coursera',
        difficulty: 'Beginner',
        duration: '4-8 weeks',
        skills: ['Skill1'],
        url: 'https://example.com/course1',
      },
      {
        id: '2',
        title: 'Course 2',
        description: 'Description 2',
        platform: 'Udemy',
        difficulty: 'Intermediate',
        duration: '8-12 weeks',
        skills: ['Skill2'],
        url: 'https://example.com/course2',
      }
    ];

    (apiRequest as Mock).mockResolvedValueOnce(mockApiCourses);

    renderWithClient(<CourseRecommendations missingSkills={['Skill1', 'Skill2']} />);
    
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getAllByTestId('course-card')).toHaveLength(2);
    });
  });
}); 