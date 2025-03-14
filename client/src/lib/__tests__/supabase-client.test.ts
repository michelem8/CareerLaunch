import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase, testConnection, getSupabaseStatus, getUserResumeAnalysis } from '../supabase-client';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockFrom = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockSingle = vi.fn();
  
  return {
    createClient: () => ({
      from: mockFrom,
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle
    }),
  };
});

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      // Arrange
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            data: [{ name: 'Test connection' }],
            error: null
          })
        })
      });

      // Act
      const result = await testConnection();

      // Assert
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('test');
    });

    it('should return false when connection fails', async () => {
      // Arrange
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            data: null,
            error: new Error('Connection failed')
          })
        })
      });

      // Act
      const result = await testConnection();

      // Assert
      expect(result).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('test');
    });
  });

  describe('getSupabaseStatus', () => {
    it('should return connected status when connection is successful', async () => {
      // Arrange
      vi.spyOn(global, 'testConnection').mockResolvedValue(true);

      // Act
      const result = await getSupabaseStatus();

      // Assert
      expect(result.connected).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error status when connection fails', async () => {
      // Arrange
      vi.spyOn(global, 'testConnection').mockResolvedValue(false);

      // Act
      const result = await getSupabaseStatus();

      // Assert
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Could not connect to Supabase');
    });
  });

  describe('getUserResumeAnalysis', () => {
    it('should return resume analysis when found', async () => {
      // Arrange
      const mockAnalysis = {
        id: 1,
        skills: ['JavaScript', 'React'],
        missing_skills: ['TypeScript'],
        recommendations: ['Learn TypeScript'],
        suggested_roles: ['Frontend Developer'],
        experience: ['Company A'],
        education: ['University B']
      };

      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: mockAnalysis,
                  error: null
                })
              })
            })
          })
        })
      });

      // Act
      const result = await getUserResumeAnalysis('1');

      // Assert
      expect(result).toEqual({
        skills: ['JavaScript', 'React'],
        missingSkills: ['TypeScript'],
        recommendations: ['Learn TypeScript'],
        suggestedRoles: ['Frontend Developer'],
        experience: ['Company A'],
        education: ['University B']
      });
      expect(supabase.from).toHaveBeenCalledWith('resume_analysis');
    });

    it('should return null when analysis not found', async () => {
      // Arrange
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: null,
                  error: new Error('Not found')
                })
              })
            })
          })
        })
      });

      // Act
      const result = await getUserResumeAnalysis('999');

      // Assert
      expect(result).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('resume_analysis');
    });
  });
}); 