import { JobBoardService, JobListing } from './JobBoardService';

export interface SkillGapAnalysis {
  missingSkills: string[];
  skillFrequency: Record<string, number>;
  recommendedSkills: string[];
}

export class SkillsAnalyzer {
  constructor(private jobBoardService: JobBoardService) {}

  async analyzeSkillGaps(targetRole: string, currentSkills: string[]): Promise<SkillGapAnalysis> {
    try {
      const jobListings = await this.jobBoardService.fetchJobListings(targetRole);
      
      if (jobListings.length === 0) {
        return {
          missingSkills: [],
          skillFrequency: {},
          recommendedSkills: []
        };
      }

      const skillFrequency: Record<string, number> = {};
      const currentSkillsSet = new Set(currentSkills.map(skill => skill.toLowerCase()));

      // Analyze required skills from job listings
      jobListings.forEach(job => {
        job.requiredSkills.forEach(skill => {
          const normalizedSkill = skill.toLowerCase();
          if (!currentSkillsSet.has(normalizedSkill)) {
            skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
          }
        });
      });

      // Sort skills by frequency
      const sortedSkills = Object.entries(skillFrequency)
        .sort(([, a], [, b]) => b - a)
        .map(([skill]) => skill);

      return {
        missingSkills: sortedSkills,
        skillFrequency,
        recommendedSkills: sortedSkills
      };
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error('Failed to analyze skill gaps');
    }
  }
} 