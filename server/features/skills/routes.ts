import { Router } from 'express';
import { SkillsController } from './SkillsController';

const router = Router();
const skillsController = new SkillsController();

// Add logging middleware
router.use((req, res, next) => {
  console.log('Skills route accessed:', req.method, req.path);
  next();
});

router.post('/analyze', (req, res, next) => {
  console.log('Analyze endpoint hit with body:', req.body);
  skillsController.analyzeSkills(req, res).catch(next);
});

export default router; 