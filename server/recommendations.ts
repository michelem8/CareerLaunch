import type { User, Course } from '@shared/schema';
import { getSkillGapAnalysis } from './openai';

interface ScoredCourse extends Course {
  score: number;
}

export async function getRecommendedCourses(user: User, courses: Course[]): Promise<Course[]> {
  if (!user || !courses.length) {
    return [];
  }

  try {
    // Get skill gap analysis for target role
    const currentSkills = [
      ...(user.skills || []),
      ...(user.resumeAnalysis?.skills || [])
    ];

    const skillGap = await getSkillGapAnalysis(
      currentSkills,
      user.targetRole || '',
      { currentRole: user.currentRole || undefined }
    );

    const missingSkills = new Set<string>(skillGap.missingSkills || []);

    // Score each course based on multiple factors
    const scoredCourses: ScoredCourse[] = courses.map(course => {
      let score = 0;

      // Prioritize courses that teach missing skills
      const teachesNeededSkills = course.skills.some(skill => 
        missingSkills.has(skill) || 
        Array.from(missingSkills).some(missing => 
          skill.toLowerCase().includes(missing.toLowerCase()) ||
          missing.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (teachesNeededSkills) {
        score += 50;
      }

      // Skip courses that only teach skills the user already has
      const userSkills = new Set(currentSkills);
      const onlyTeachesKnownSkills = course.skills.every(skill => userSkills.has(skill));
      if (onlyTeachesKnownSkills) {
        score -= 100;
      }

      // Match learning style preferences
      if (user.preferences?.learningStyles.includes(course.learningStyle)) {
        score += 20;
      }

      // Match time commitment
      if (user.preferences?.timeCommitment === course.timeCommitment) {
        score += 15;
      }

      // Match industry preferences
      if (user.preferences?.preferredIndustries.includes(course.industry)) {
        score += 10;
      }

      return {
        ...course,
        score
      };
    });

    // Sort by score and return courses
    return scoredCourses
      .filter(course => course.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...course }) => course);
  } catch (error) {
    console.error("Error getting course recommendations:", error);
    return [];
  }
} 