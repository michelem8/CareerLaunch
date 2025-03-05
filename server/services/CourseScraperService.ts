import axios from 'axios';
import type { Course } from '@shared/schema';

interface UdemyCourseResponse {
  results: Array<{
    id: number;
    title: string;
    headline: string;
    image_480x270: string;
    content_info_short: string;
    instructional_level: string;
    primary_category: {
      title: string;
    };
  }>;
}

export class CourseScraperService {
  private rapidApiKey: string;
  private rapidApiHost: string;

  constructor() {
    this.rapidApiKey = process.env.RAPID_API_KEY || '';
    this.rapidApiHost = process.env.RAPID_API_HOST || '';
  }

  async searchCourses(searchQuery: string): Promise<Course[]> {
    try {
      // Using Udemy API through RapidAPI
      const response = await axios.get<UdemyCourseResponse>('https://udemy-course-scraper-api.p.rapidapi.com/course/search', {
        params: { search: searchQuery, page_size: '20' },
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'udemy-course-scraper-api.p.rapidapi.com'
        }
      });

      // Transform the response into our Course format
      return response.data.results.map(course => ({
        id: Number(course.id),
        title: course.title,
        description: course.headline,
        imageUrl: course.image_480x270,
        skills: this.extractSkillsFromDescription(course.headline),
        difficulty: this.inferDifficulty(course.title, course.headline),
        industry: this.inferIndustry(course.primary_category.title),
        learningStyle: 'self-paced',
        timeCommitment: `${Math.round(course.content_info_short.split(' ')[0])} hours`,
        level: this.mapLevel(course.instructional_level)
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  private extractSkillsFromDescription(description: string): string[] {
    // Extract skills from course description using common patterns
    const skills: Set<string> = new Set();
    const words = description.toLowerCase().split(/[\s,]+/);
    
    const commonTechSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws',
      'leadership', 'management', 'agile', 'scrum', 'data', 'analysis',
      'machine learning', 'ai', 'cloud', 'devops', 'design'
    ];

    words.forEach(word => {
      if (commonTechSkills.includes(word)) {
        skills.add(word);
      }
    });

    return Array.from(skills);
  }

  private inferDifficulty(title: string, description: string): 'beginner' | 'intermediate' | 'advanced' {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('advanced') || text.includes('expert') || text.includes('professional')) {
      return 'advanced';
    }
    if (text.includes('intermediate') || text.includes('experienced')) {
      return 'intermediate';
    }
    return 'beginner';
  }

  private inferIndustry(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'Development': 'software-development',
      'Business': 'business',
      'IT & Software': 'technology',
      'Design': 'design',
      'Marketing': 'marketing',
      'Personal Development': 'personal-development',
      'Data Science': 'data-science'
    };
    return categoryMap[category] || 'technology';
  }

  private mapLevel(level: string): string {
    const levelMap: { [key: string]: string } = {
      'All Levels': 'intermediate',
      'Beginner': 'beginner',
      'Intermediate': 'intermediate',
      'Expert': 'advanced'
    };
    return levelMap[level] || 'intermediate';
  }
} 