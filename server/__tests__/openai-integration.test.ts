import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getRecommendedCourses } from '../recommendations';
import type { User } from '@shared/schema';
import { openai } from '../openai-client';

// Mock the OpenAI client
vi.mock('../openai-client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }
}));

describe('OpenAI Integration for Course Recommendations', () => {
  let mockUser: User;
  
  beforeEach(() => {
    // Set up test environment
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'test';
    
    // Mock user data
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
    
    // Reset the mock before each test
    vi.mocked(openai.chat.completions.create).mockReset();
    
    // Set up mock OpenAI response
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
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
                title: "Technical Leadership",
                description: "Develop leadership skills for technical roles",
                platform: "Udemy",
                difficulty: "Intermediate",
                duration: "8 weeks",
                skills: ["Leadership", "Team Management"],
                url: "https://udemy.com/tech-leadership",
                price: "$59.99",
                rating: 4.6,
                aiMatchScore: 90
              }
            ]
          })
        }
      }]
    } as any);
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should call OpenAI API with correct parameters', async () => {
    await getRecommendedCourses(mockUser);
    
    expect(openai.chat.completions.create).toHaveBeenCalled();
    
    // Verify the OpenAI call parameters
    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-3.5-turbo');
    
    // Check that user data is passed correctly
    const userContent = JSON.parse(callArgs.messages[1].content);
    expect(userContent.currentRole).toBe(mockUser.currentRole);
    expect(userContent.targetRole).toBe(mockUser.targetRole);
    expect(userContent.missingSkills).toEqual(mockUser.resumeAnalysis?.missingSkills);
  });
  
  it('should process and return course recommendations from OpenAI', async () => {
    const recommendations = await getRecommendedCourses(mockUser);
    
    // Verify we get the right courses back
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].title).toBe('System Design for Senior Engineers');
    expect(recommendations[1].title).toBe('Technical Leadership');
    
    // Verify courses are sorted by AI match score
    expect(recommendations[0].aiMatchScore).toBeGreaterThan(recommendations[1].aiMatchScore || 0);
  });
  
  it('should handle missing skills gracefully', async () => {
    // Test with empty missing skills
    if (mockUser.resumeAnalysis) {
      mockUser.resumeAnalysis.missingSkills = [];
    }
    
    const recommendations = await getRecommendedCourses(mockUser);
    expect(recommendations).toHaveLength(0);
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });
  
  it('should handle OpenAI errors gracefully', async () => {
    // Mock OpenAI to throw an error
    vi.mocked(openai.chat.completions.create).mockRejectedValue(new Error('API error'));
    
    const recommendations = await getRecommendedCourses(mockUser);
    expect(recommendations).toHaveLength(0);
  });
}); 