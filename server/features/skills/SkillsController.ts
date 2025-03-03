import { Request, Response } from 'express';
import { SkillsAnalyzer } from './SkillsAnalyzer';
import { JobBoardService } from './JobBoardService';
import { z } from 'zod';

const analyzeSkillsSchema = z.object({
  targetRole: z.string(),
  currentSkills: z.array(z.string())
});

export class SkillsController {
  private skillsAnalyzer: SkillsAnalyzer;

  constructor() {
    const jobBoardService = new JobBoardService();
    this.skillsAnalyzer = new SkillsAnalyzer(jobBoardService);
  }

  analyzeSkills = async (req: Request, res: Response) => {
    try {
      console.log('Analyzing skills with request body:', req.body);
      const { targetRole, currentSkills } = analyzeSkillsSchema.parse(req.body);

      const analysis = await this.skillsAnalyzer.analyzeSkillGaps(targetRole, currentSkills);
      console.log('Analysis result:', analysis);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error in skills analysis:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.errors
        });
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze skills';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };
} 