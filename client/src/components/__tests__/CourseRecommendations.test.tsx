import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseRecommendations from '../CourseRecommendations';
import { vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CourseRecommendations', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('loads and displays courses from API', async () => {
    const mockApiCourses = [
      {
        id: 1,
        title: 'API Course 1',
        description: 'Test course from API',
        imageUrl: 'https://example.com/course1.jpg',
        skills: ['Programming'],
        difficulty: 'beginner',
        industry: 'Technology',
        learningStyle: 'Visual',
        timeCommitment: '4-8',
        level: 'Beginner'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiCourses,
    });

    render(<CourseRecommendations missingSkills={['Programming']} />);
    
    // Should show loading state initially
    expect(screen.getByText(/Loading course recommendations.../i)).toBeInTheDocument();
    
    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getByText('API Course 1')).toBeInTheDocument();
    });

    // Verify API was called
    expect(mockFetch).toHaveBeenCalledWith('/api/courses/recommended');
  });

  test('handles API error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<CourseRecommendations missingSkills={['Programming']} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load courses/i)).toBeInTheDocument();
    });
  });

  test('displays no courses message when API returns empty array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<CourseRecommendations missingSkills={['Programming']} />);

    await waitFor(() => {
      expect(screen.getByText(/No courses available/i)).toBeInTheDocument();
    });
  });

  test('displays message when no missing skills are provided', () => {
    render(<CourseRecommendations missingSkills={[]} />);
    
    expect(screen.getByText('No skill gaps identified')).toBeInTheDocument();
    expect(screen.queryByTestId('course-card')).not.toBeInTheDocument();
  });

  test('displays loading state when fetching courses', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<CourseRecommendations missingSkills={['Programming']} />);
    
    expect(screen.getByText(/Loading course recommendations.../i)).toBeInTheDocument();
  });

  test('displays error state when API returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CourseRecommendations missingSkills={['Programming']} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch course recommendations/i)).toBeInTheDocument();
    });
  });

  test('does not fetch courses when no missing skills are provided', async () => {
    render(<CourseRecommendations missingSkills={[]} />);
    
    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.getByText('No skill gaps identified')).toBeInTheDocument();
  });

  test('displays multiple courses from API', async () => {
    const mockApiCourses = [
      {
        id: 1,
        title: 'Course 1',
        description: 'Description 1',
        imageUrl: 'https://example.com/course1.jpg',
        skills: ['Skill1'],
        difficulty: 'beginner',
        industry: 'Technology',
        learningStyle: 'Visual',
        timeCommitment: '4-8',
        level: 'Beginner'
      },
      {
        id: 2,
        title: 'Course 2',
        description: 'Description 2',
        imageUrl: 'https://example.com/course2.jpg',
        skills: ['Skill2'],
        difficulty: 'intermediate',
        industry: 'Technology',
        learningStyle: 'Practical',
        timeCommitment: '4-8',
        level: 'Intermediate'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiCourses,
    });

    render(<CourseRecommendations missingSkills={['Skill1', 'Skill2']} />);
    
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getAllByTestId('course-card')).toHaveLength(2);
    });
  });
}); 