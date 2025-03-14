import { SupabaseStorage } from '../storage';
import { getUserProfile, getResumeAnalysis, updateResumeAnalysis } from '../supabase-client';
import { ResumeAnalysis } from '../../shared/schema';

// Mock the Supabase client functions
jest.mock('../supabase-client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
  getUserProfile: jest.fn(),
  getResumeAnalysis: jest.fn(),
  updateResumeAnalysis: jest.fn()
}));

describe('SupabaseStorage', () => {
  let storage: SupabaseStorage;

  beforeEach(() => {
    storage = new SupabaseStorage();
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return a user when found', async () => {
      // Arrange
      const mockProfile = {
        id: 1,
        user_id: '1',
        current_role: 'Frontend Developer',
        target_role: 'Senior Developer',
        skills: ['JavaScript', 'React'],
        has_completed_survey: true,
        survey_step: 3
      };

      const mockAnalysis = {
        id: 1,
        user_id: '1',
        skills: ['JavaScript', 'React'],
        missing_skills: ['TypeScript'],
        recommendations: ['Learn TypeScript'],
        suggested_roles: ['Frontend Developer'],
        experience: ['Company A'],
        education: ['University B']
      };

      (getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
      (getResumeAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

      // Act
      const user = await storage.getUser(1);

      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.currentRole).toBe('Frontend Developer');
      expect(user?.resumeAnalysis?.missingSkills).toEqual(['TypeScript']);
      expect(getUserProfile).toHaveBeenCalledWith('1');
      expect(getResumeAnalysis).toHaveBeenCalledWith('1');
    });

    it('should return undefined when user not found', async () => {
      // Arrange
      (getUserProfile as jest.Mock).mockResolvedValue(null);

      // Act
      const user = await storage.getUser(999);

      // Assert
      expect(user).toBeUndefined();
      expect(getUserProfile).toHaveBeenCalledWith('999');
      expect(getResumeAnalysis).not.toHaveBeenCalled();
    });

    it('should handle missing resume analysis', async () => {
      // Arrange
      const mockProfile = {
        id: 1,
        user_id: '1',
        current_role: 'Frontend Developer',
        target_role: 'Senior Developer',
        skills: ['JavaScript', 'React'],
        has_completed_survey: true,
        survey_step: 3
      };

      (getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
      (getResumeAnalysis as jest.Mock).mockResolvedValue(null);

      // Act
      const user = await storage.getUser(1);

      // Assert
      expect(user).toBeDefined();
      expect(user?.resumeAnalysis).toBeNull();
      expect(getUserProfile).toHaveBeenCalledWith('1');
      expect(getResumeAnalysis).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUserResumeAnalysis', () => {
    it('should update resume analysis and return updated user', async () => {
      // Arrange
      const userId = 1;
      const analysis: ResumeAnalysis = {
        skills: ['JavaScript', 'React'],
        missingSkills: ['TypeScript'],
        recommendations: ['Learn TypeScript'],
        suggestedRoles: ['Frontend Developer'],
        experience: ['Company A'],
        education: ['University B']
      };

      const mockProfile = {
        id: 1,
        user_id: '1',
        current_role: 'Frontend Developer',
        target_role: 'Senior Developer',
        skills: ['JavaScript', 'React'],
        has_completed_survey: true,
        survey_step: 3
      };

      const mockAnalysis = {
        id: 1,
        user_id: '1',
        skills: ['JavaScript', 'React'],
        missing_skills: ['TypeScript'],
        recommendations: ['Learn TypeScript'],
        suggested_roles: ['Frontend Developer'],
        experience: ['Company A'],
        education: ['University B']
      };

      (updateResumeAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);
      (getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
      (getResumeAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);

      // Mock the supabase update method
      const mockUpdateResponse = { error: null };
      const mockFromMethod = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(mockUpdateResponse)
        })
      });
      
      // @ts-ignore - We're mocking
      storage.supabase = { from: mockFromMethod };

      // Act
      const result = await storage.updateUserResumeAnalysis(userId, analysis);

      // Assert
      expect(updateResumeAnalysis).toHaveBeenCalledWith('1', {
        skills: ['JavaScript', 'React'],
        missing_skills: ['TypeScript'],
        recommendations: ['Learn TypeScript'],
        suggested_roles: ['Frontend Developer'],
        experience: ['Company A'],
        education: ['University B']
      });
      expect(result).toBeDefined();
      expect(result.resumeAnalysis?.missingSkills).toEqual(['TypeScript']);
    });
  });

  // Add more tests for other methods...
}); 