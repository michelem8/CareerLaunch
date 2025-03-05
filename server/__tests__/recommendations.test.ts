import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecommendedCourses } from '../recommendations';
import type { User } from '@shared/schema';

// Mock OpenAI client
vi.mock('../openai-client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                courses: [
                  {
                    id: "1",
                    title: "System Design for Senior Engineers",
                    description: "Learn advanced system design concepts",
                    platform: "Coursera",
                    difficulty: "Advanced",
                    duration: "12 weeks",
                    skills: ["System Design", "Architecture", "Scalability"],
                    url: "https://coursera.org/system-design",
                    price: "$79",
                    rating: 4.8,
                    aiMatchScore: 95
                  },
                  {
                    id: "2",
                    title: "Basic JavaScript",
                    description: "JavaScript fundamentals",
                    platform: "Udemy",
                    difficulty: "Beginner",
                    duration: "6 weeks",
                    skills: ["JavaScript", "Web Development"],
                    url: "https://udemy.com/js-basics",
                    price: "$49.99",
                    rating: 4.5,
                    aiMatchScore: 85
                  }
                ]
              })
            }
          }]
        })
      }
    }
  }
}));

describe('Course Recommendations', () => {
  let mockUser: User;

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
      skills: ['JavaScript', 'React', 'Node.js'],
      preferences: {
        preferredIndustries: ['consumer', 'enterprise-software'],
        learningStyles: ['practical', 'project_based'],
        timeCommitment: '4-8'
      },
      resumeAnalysis: {
        skills: ['JavaScript', 'React', 'Node.js', 'Product Management'],
        experience: ['3 years software development'],
        education: ['Computer Science degree'],
        suggestedRoles: ['Senior Software Engineer', 'Lead Developer'],
        missingSkills: ['System Design', 'Architecture', 'Leadership'],
        recommendations: []
      },
      hasCompletedSurvey: true,
      surveyStep: 3
    };
  });

  it('should return course recommendations', async () => {
    const recommendations = await getRecommendedCourses(mockUser);
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].title).toBe('System Design for Senior Engineers');
  });

  it('should sort recommendations by AI match score', async () => {
    const recommendations = await getRecommendedCourses(mockUser);
    expect(recommendations[0].aiMatchScore).toBeGreaterThan(recommendations[1].aiMatchScore || 0);
  });

  it('should handle empty missing skills', async () => {
    mockUser.resumeAnalysis!.missingSkills = [];
    const recommendations = await getRecommendedCourses(mockUser);
    expect(recommendations).toHaveLength(0);
  });

  it('should handle missing user preferences', async () => {
    mockUser.preferences = null;
    const recommendations = await getRecommendedCourses(mockUser);
    expect(recommendations.length).toBeGreaterThan(0);
  });
}); 