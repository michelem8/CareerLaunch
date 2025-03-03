import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecommendedCourses } from '../recommendations';
import type { User, Course } from '@shared/schema';
import { JobSkillsScraper } from '../services/jobSkillsScraper';

// Mock OpenAI client
vi.mock('../openai-client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                missingSkills: ['System Design', 'Architecture', 'Leadership'],
                recommendations: [
                  'Learn system design principles',
                  'Study software architecture patterns',
                  'Develop leadership skills'
                ]
              })
            }
          }]
        })
      }
    }
  }
}));

// Mock JobSkillsScraper
vi.mock('../services/jobSkillsScraper', () => ({
  JobSkillsScraper: vi.fn().mockImplementation(() => ({
    scrapeSkillsForRole: vi.fn().mockResolvedValue([
      { name: 'System Design', frequency: 10 },
      { name: 'Architecture', frequency: 8 },
      { name: 'Leadership', frequency: 6 }
    ])
  }))
}));

describe('Course Recommendations', () => {
  let mockUser: User;
  let mockCourses: Course[];

  beforeEach(() => {
    // Set test environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'test';

    mockUser = {
      id: 1,
      username: 'test_user',
      password: 'test_password',
      currentRole: 'Software Engineer',
      targetRole: 'Senior Software Engineer',
      skills: ['JavaScript', 'React'],
      preferences: {
        preferredIndustries: ['consumer', 'enterprise-software'],
        learningStyles: ['practical', 'project_based'],
        timeCommitment: '4-8'
      },
      resumeAnalysis: {
        skills: ['JavaScript', 'React', 'Product Management'],
        experience: ['3 years software development'],
        education: ['Computer Science degree'],
        suggestedRoles: ['Senior Software Engineer', 'Lead Developer']
      },
      hasCompletedSurvey: true
    };

    mockCourses = [
      {
        id: 1,
        title: 'System Design for Senior Engineers',
        description: 'Learn advanced system design concepts',
        imageUrl: 'https://example.com/system-design.jpg',
        skills: ['System Design', 'Architecture'],
        difficulty: 'advanced',
        industry: 'enterprise-software',
        learningStyle: 'practical',
        timeCommitment: '4-8',
        level: 'advanced'
      },
      {
        id: 2,
        title: 'Basic JavaScript',
        description: 'JavaScript fundamentals',
        imageUrl: 'https://example.com/javascript.jpg',
        skills: ['JavaScript'],
        difficulty: 'beginner',
        industry: 'consumer',
        learningStyle: 'theoretical',
        timeCommitment: '2-4',
        level: 'beginner'
      }
    ];

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should prioritize courses that match skill gaps for target role', async () => {
    const recommendations = await getRecommendedCourses(mockUser, mockCourses);
    expect(recommendations[0].title).toBe('System Design for Senior Engineers');
  }, 30000); // Increase timeout to 30 seconds

  it('should consider user learning preferences', async () => {
    const recommendations = await getRecommendedCourses(mockUser, mockCourses);
    expect(recommendations[0].learningStyle).toBe('practical');
  }, 30000); // Increase timeout to 30 seconds

  it('should match user time commitment', async () => {
    const recommendations = await getRecommendedCourses(mockUser, mockCourses);
    expect(recommendations[0].timeCommitment).toBe('4-8');
  }, 30000); // Increase timeout to 30 seconds

  it('should filter out courses for skills user already has', async () => {
    const recommendations = await getRecommendedCourses(mockUser, mockCourses);
    expect(recommendations.find(course => course.title === 'Basic JavaScript')).toBeUndefined();
  }, 30000); // Increase timeout to 30 seconds

  it('should return empty array if no suitable courses found', async () => {
    const recommendations = await getRecommendedCourses(mockUser, []);
    expect(recommendations).toHaveLength(0);
  });
}); 