import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCareerRecommendations, generateCourseRecommendations } from '../lib/ai-provider';

// Mock the OpenAI client
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async ({ messages, response_format }) => {
            // Check if this is a career recommendations request (text format)
            if (messages[0].content.includes('career development expert') && 
                !messages[0].content.includes('course recommendations')) {
              return {
                choices: [
                  {
                    message: {
                      content: 'Take courses on leadership.\nPractice team management.\nRead books on architecture.',
                    },
                  },
                ],
              };
            }
            
            // Course recommendations request (JSON format)
            if (response_format?.type === 'json_object') {
              return {
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        courses: [
                          {
                            id: 'course-1',
                            title: 'Leadership 101',
                            description: 'Learn leadership skills',
                            platform: 'Udemy',
                            difficulty: 'Intermediate',
                            duration: '6 weeks',
                            skills: ['Leadership', 'Management'],
                            url: 'https://example.com/course',
                            price: '$49.99',
                            rating: 4.7,
                            aiMatchScore: 92,
                          },
                        ],
                      }),
                    },
                  },
                ],
              };
            }
            
            // Default response
            return {
              choices: [
                {
                  message: {
                    content: 'Default response',
                  },
                },
              ],
            };
          }),
        },
      },
    })),
  };
});

describe('OpenAI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCareerRecommendations', () => {
    it('should return recommendations based on skills', async () => {
      // Act
      const result = await generateCareerRecommendations(['Leadership', 'Management']);
      
      // Assert
      expect(result).toHaveProperty('recommendations');
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations).toHaveLength(3);
      expect(result.recommendations[0]).toBe('Take courses on leadership.');
    });

    it('should handle empty skills array', async () => {
      // Act
      const result = await generateCareerRecommendations([]);
      
      // Assert
      expect(result).toHaveProperty('recommendations');
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe('generateCourseRecommendations', () => {
    it('should return course recommendations based on missing skills', async () => {
      // Act
      const result = await generateCourseRecommendations(['Leadership', 'Management']);
      
      // Assert
      expect(result).toHaveProperty('courses');
      expect(result.courses).toBeInstanceOf(Array);
      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].title).toBe('Leadership 101');
      expect(result.courses[0].aiMatchScore).toBe(92);
    });

    it('should handle empty skills array', async () => {
      // Act
      const result = await generateCourseRecommendations([]);
      
      // Assert
      expect(result).toHaveProperty('courses');
      expect(result.courses).toBeInstanceOf(Array);
      expect(result.courses).toHaveLength(0);
    });
  });
}); 