import type { User, Course } from '@shared/schema';
import { getSkillGapAnalysis } from './openai';
import { openai } from './openai-client';

interface ScoredCourse extends Course {
  score: number;
}

// Helper function to check if two skills are related
function areSkillsRelated(skill1: string, skill2: string): boolean {
  const s1 = skill1.toLowerCase();
  const s2 = skill2.toLowerCase();
  
  // Direct match
  if (s1 === s2) return true;
  
  // Substring match
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Common variations
  const variations: { [key: string]: string[] } = {
    'javascript': ['js', 'node', 'nodejs', 'typescript', 'ts'],
    'python': ['py', 'django', 'flask'],
    'database': ['sql', 'nosql', 'mongodb', 'postgres'],
    'frontend': ['react', 'vue', 'angular', 'web'],
    'backend': ['api', 'server', 'rest', 'graphql'],
    'devops': ['ci/cd', 'docker', 'kubernetes', 'aws', 'cloud'],
    'testing': ['test', 'qa', 'quality', 'jest', 'cypress']
  };
  
  // Check if skills are related through common variations
  for (const [base, related] of Object.entries(variations)) {
    if ((s1.includes(base) || related.some(r => s1.includes(r))) &&
        (s2.includes(base) || related.some(r => s2.includes(r)))) {
      return true;
    }
  }
  
  return false;
}

async function rankCoursesWithAI(courses: Course[], user: User, missingSkills: Set<string>): Promise<ScoredCourse[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career development expert specializing in course recommendations. 
Your task is to analyze and rank courses based on their relevance to a user's skill gaps and career goals.
Return a JSON array of course scores, where each score is a number between 0 and 100.
Consider:
1. How well the course content matches the user's missing skills
2. The course's difficulty level relative to the user's experience
3. Whether the course matches the user's learning style preferences
4. How many missing skills the course covers
5. The course's relevance to the user's target role`
        },
        {
          role: "user",
          content: JSON.stringify({
            courses: courses.map(c => ({
              title: c.title,
              description: c.description,
              skills: c.skills,
              difficulty: c.difficulty,
              learningStyle: c.learningStyle
            })),
            user: {
              currentRole: user.currentRole,
              targetRole: user.targetRole,
              currentSkills: [
                ...(user.skills || []),
                ...(user.resumeAnalysis?.skills || [])
              ],
              missingSkills: Array.from(missingSkills),
              preferences: user.preferences
            }
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    const scores = JSON.parse(content).scores as number[];
    return courses.map((course, index) => ({
      ...course,
      score: scores[index]
    }));
  } catch (error) {
    console.error('Error ranking courses with AI:', error);
    // Fallback to basic scoring if AI fails
    return courses.map(course => {
      let score = 0;
      course.skills.forEach(courseSkill => {
        for (const missingSkill of missingSkills) {
          if (areSkillsRelated(courseSkill, missingSkill)) {
            score += courseSkill.toLowerCase() === missingSkill.toLowerCase() ? 100 : 75;
          }
        }
      });
      return { ...course, score };
    });
  }
}

export async function getRecommendedCourses(user: User): Promise<Course[]> {
  if (!user) {
    return [];
  }

  try {
    // Get skill gap analysis for target role if not already done
    const currentSkills = [
      ...(user.skills || []),
      ...(user.resumeAnalysis?.skills || [])
    ];

    const missingSkills = user.resumeAnalysis?.missingSkills || [];
    
    console.log('Generating course recommendations for:', {
      currentRole: user.currentRole,
      targetRole: user.targetRole,
      currentSkills,
      missingSkills
    });

    if (!missingSkills.length) {
      console.log('No missing skills found, returning empty recommendations');
      return [];
    }

    // Use OpenAI to generate course recommendations
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career development expert specializing in course recommendations.
Your task is to generate a list of high-quality online courses that would help the user acquire their missing skills.
For each missing skill, recommend 1-2 relevant courses from reputable platforms like Coursera, Udemy, edX, or similar.

You must return a JSON object with the following exact structure:
{
  "courses": [
    {
      "id": "unique-id-1",
      "title": "Course Title",
      "description": "2-3 sentence description",
      "platform": "Platform Name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "Duration (e.g., 6 weeks)",
      "skills": ["Skill 1", "Skill 2"],
      "url": "https://course-url.com",
      "price": "Free|$XX.XX",
      "rating": 4.5,
      "aiMatchScore": 85
    }
  ]
}

Consider:
1. User's current role and target role
2. Their existing skills
3. The specific skills they need to acquire
4. Progression from beginner to advanced topics
5. Course quality and reputation
6. Mix of theoretical and practical learning`
        },
        {
          role: "user",
          content: JSON.stringify({
            currentRole: user.currentRole,
            targetRole: user.targetRole,
            currentSkills: currentSkills,
            missingSkills: missingSkills,
            preferences: user.preferences
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error('No content received from OpenAI');
      throw new Error("No response received from OpenAI");
    }

    console.log('Raw OpenAI response:', content);

    const parsed = JSON.parse(content);
    if (!parsed.courses || !Array.isArray(parsed.courses)) {
      console.error('Invalid response format from OpenAI:', parsed);
      throw new Error("Invalid response format from OpenAI");
    }

    const recommendations = parsed.courses as Course[];
    console.log(`Generated ${recommendations.length} course recommendations`);
    
    // Sort by AI match score
    const sortedRecommendations = recommendations.sort((a: Course, b: Course) => {
      const scoreA = a.aiMatchScore || 0;
      const scoreB = b.aiMatchScore || 0;
      return scoreB - scoreA;
    });

    return sortedRecommendations;

  } catch (error) {
    console.error("Error getting course recommendations:", error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
} 