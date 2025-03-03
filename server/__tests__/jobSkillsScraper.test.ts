import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JobSkillsScraper } from '../services/jobSkillsScraper';
import puppeteer from 'puppeteer';

// Mock Puppeteer
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(undefined),
        waitForSelector: vi.fn().mockResolvedValue(true),
        evaluate: vi.fn().mockResolvedValue([
          'We are looking for a Product Manager with experience in: Agile methodologies, data analysis, and stakeholder management.',
          'Required skills: Product strategy, user research, and technical communication.',
          'Nice to have: SQL, Python, and machine learning knowledge.'
        ]),
        close: vi.fn().mockResolvedValue(undefined)
      }),
      close: vi.fn().mockResolvedValue(undefined)
    })
  }
}));

describe('JobSkillsScraper', () => {
  let scraper: JobSkillsScraper;
  let browser: any;
  let page: any;

  beforeEach(() => {
    scraper = new JobSkillsScraper();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  });

  describe('scrapeSkillsForRole', () => {
    it('should extract skills from job postings', async () => {
      const targetRole = 'Product Manager';
      const industries = ['technology'];
      
      const skills = await scraper.scrapeSkillsForRole(targetRole, industries);
      
      // Check that we got skills back
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
      
      // Verify structure of returned skills
      skills.forEach(skill => {
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('frequency');
        expect(typeof skill.name).toBe('string');
        expect(typeof skill.frequency).toBe('number');
      });
      
      // Verify that common PM skills were found
      const skillNames = skills.map(s => s.name.toLowerCase());
      expect(skillNames).toContain('agile');
      expect(skillNames).toContain('data analysis');
      expect(skillNames).toContain('stakeholder management');
    }, 30000); // Increase timeout to 30 seconds

    it('should handle empty industry list', async () => {
      const targetRole = 'Product Manager';
      const industries: string[] = [];
      
      const skills = await scraper.scrapeSkillsForRole(targetRole, industries);
      
      expect(Array.isArray(skills)).toBe(true);
    }, 30000); // Increase timeout to 30 seconds

    it('should throw error for invalid role', async () => {
      const targetRole = '';
      const industries = ['technology'];
      
      await expect(scraper.scrapeSkillsForRole(targetRole, industries))
        .rejects
        .toThrow('Invalid role provided');
    });
  });

  describe('normalizeSkills', () => {
    it('should combine similar skills and sum their frequencies', () => {
      const rawSkills = [
        { name: 'python', frequency: 10 },
        { name: 'Python programming', frequency: 5 },
        { name: 'SQL', frequency: 8 }
      ];
      
      const normalizedSkills = scraper.normalizeSkills(rawSkills);
      
      expect(normalizedSkills).toContainEqual({
        name: 'Python',
        frequency: 15
      });
      
      // Check that skills are sorted by frequency
      for (let i = 1; i < normalizedSkills.length; i++) {
        expect(normalizedSkills[i - 1].frequency).toBeGreaterThanOrEqual(normalizedSkills[i].frequency);
      }
    });

    it('should handle empty input', () => {
      const normalizedSkills = scraper.normalizeSkills([]);
      expect(normalizedSkills).toEqual([]);
    });
  });
}); 