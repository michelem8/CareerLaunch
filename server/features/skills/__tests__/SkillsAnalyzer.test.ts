import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillsAnalyzer } from '../SkillsAnalyzer';
import { JobBoardService } from '../JobBoardService';

// Mock the JobBoardService
vi.mock('../JobBoardService');

describe('SkillsAnalyzer', () => {
  let skillsAnalyzer: SkillsAnalyzer;
  let mockJobBoardService: jest.Mocked<JobBoardService>;

  beforeEach(() => {
    mockJobBoardService = {
      fetchJobListings: vi.fn(),
    } as any;
    skillsAnalyzer = new SkillsAnalyzer(mockJobBoardService);
  });

  describe('analyzeSkillGaps', () => {
    it('should return skill gaps based on target role and current skills', async () => {
      const targetRole = 'Software Engineer';
      const currentSkills = ['JavaScript', 'HTML', 'CSS'];
      const mockJobListings = [
        {
          title: 'Software Engineer',
          requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        },
        {
          title: 'Software Engineer',
          requiredSkills: ['JavaScript', 'Python', 'AWS', 'Docker'],
        },
      ];

      mockJobBoardService.fetchJobListings.mockResolvedValue(mockJobListings);

      const result = await skillsAnalyzer.analyzeSkillGaps(targetRole, currentSkills);

      expect(result).toEqual({
        missingSkills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
        skillFrequency: {
          'TypeScript': 1,
          'React': 1,
          'Node.js': 1,
          'Python': 1,
          'AWS': 1,
          'Docker': 1,
        },
        recommendedSkills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
      });
    });

    it('should handle empty job listings', async () => {
      mockJobBoardService.fetchJobListings.mockResolvedValue([]);

      const result = await skillsAnalyzer.analyzeSkillGaps('Software Engineer', ['JavaScript']);

      expect(result).toEqual({
        missingSkills: [],
        skillFrequency: {},
        recommendedSkills: [],
      });
    });

    it('should throw error when job board service fails', async () => {
      mockJobBoardService.fetchJobListings.mockRejectedValue(new Error('API Error'));

      await expect(
        skillsAnalyzer.analyzeSkillGaps('Software Engineer', ['JavaScript'])
      ).rejects.toThrow('Failed to analyze skill gaps');
    });
  });
}); 