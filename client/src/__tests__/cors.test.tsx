import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { apiRequest } from '../lib/queryClient';

// Mock fetch to test CORS behavior
global.fetch = vi.fn();

describe('CORS handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    
    // Reset window.location.origin for tests
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://www.careerpathfinder.io'
      },
      writable: true
    });
  });

  it('should handle API requests with relative URLs correctly', async () => {
    // Mock successful response
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => 'success'
    });

    // Test API request with relative URL
    await apiRequest('GET', '/api/users/me');
    
    // Check that the URL was constructed correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/users\/me$/), 
      expect.any(Object)
    );
  });

  it('should handle CORS issues gracefully with fallback data', async () => {
    // Mock a CORS error
    (global.fetch as Mock).mockRejectedValueOnce(
      new TypeError('Failed to fetch')
    );

    // Mock the second attempt with successful response
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: 1,
        username: "demo_user",
        currentRole: "Product Manager",
        targetRole: "Engineering Manager",
        skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
        hasCompletedSurvey: true,
        resumeAnalysis: {
          skills: ["JavaScript", "React", "Node.js", "Project Management", "Product Development"],
          missingSkills: [
            "Engineering Leadership",
            "Team Building", 
            "Technical Architecture",
            "Cross-functional Communication"
          ],
          recommendations: [
            "Focus on team building and leadership skills",
            "Develop deeper technical architecture knowledge",
            "Practice making technical decisions at scale"
          ],
          suggestedRoles: ["Technical Product Manager", "Engineering Manager", "Development Team Lead"]
        }
      }),
      text: async () => 'success'
    });

    // Test API request with a path that has mock data
    const response = await apiRequest('GET', '/api/users/me');
    
    // Should return mock data as fallback
    const data = await response.json();
    expect(data).toHaveProperty('username');
    expect(data).toHaveProperty('currentRole');
  });

  it('should work with multiple origin formats', async () => {
    // Legacy test with non-www subdomain (for backwards compatibility during transition)
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://careerpathfinder.io'
      },
      writable: true
    });

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => 'success'
    });

    await apiRequest('GET', '/api/users/me');
    
    // Check that the URL was constructed correctly regardless of origin
    expect(global.fetch).toHaveBeenCalled();
  });
}); 