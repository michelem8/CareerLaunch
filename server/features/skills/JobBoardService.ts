import axios from 'axios';
import { env } from '../../config/env';

export interface JobListing {
  id: string;
  title: string;
  url: string;
  company: {
    name: string;
  };
  location: string;
  postAt: string;
  requiredSkills: string[];
}

interface LinkedInResponse {
  success: boolean;
  message: string;
  data: JobListing[];
  total: number;
}

export class JobBoardService {
  private readonly apiKey: string;
  private readonly apiHost: string;

  constructor() {
    this.apiKey = env.RAPID_API_KEY;
    this.apiHost = env.RAPID_API_HOST;
  }

  async fetchJobListings(role: string): Promise<JobListing[]> {
    try {
      console.log(`Fetching job listings for role: ${role}`);
      
      const response = await axios.get<LinkedInResponse>('https://' + this.apiHost + '/search-jobs-v2', {
        params: {
          keywords: role,
          locationId: '92000000',
          datePosted: 'anyTime',
          sort: 'mostRelevant'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        }
      });

      if (!response.data.success) {
        throw new Error('Failed to fetch job listings: ' + response.data.message);
      }

      // Extract skills from job listings
      const jobListings = response.data.data.map(job => ({
        ...job,
        requiredSkills: this.extractSkillsFromJobListing(job)
      }));

      return jobListings;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      throw new Error('Failed to fetch job listings');
    }
  }

  private extractSkillsFromJobListing(job: JobListing): string[] {
    const commonSkills = new Set<string>();
    const technicalSkills = new Set([
      'golang', 'go', 'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure',
      'microservices', 'rest', 'grpc', 'sql', 'nosql', 'mongodb', 'postgresql',
      'redis', 'kafka', 'rabbitmq', 'git', 'ci/cd', 'jenkins', 'github actions',
      'gitlab ci', 'testing', 'unit testing', 'integration testing', 'tdd',
      'agile', 'scrum', 'linux', 'unix', 'api', 'backend', 'distributed systems',
      'cloud', 'containerization', 'orchestration', 'monitoring', 'logging',
      'debugging', 'performance tuning', 'security', 'authentication', 'authorization'
    ]);

    const titleLower = job.title.toLowerCase();
    
    // Extract skills from job title
    for (const skill of technicalSkills) {
      if (titleLower.includes(skill.toLowerCase())) {
        commonSkills.add(skill);
      }
    }

    return Array.from(commonSkills);
  }

  async analyzeSkills(targetRole: string, currentSkills: string[]): Promise<string[]> {
    try {
      const jobListings = await this.fetchJobListings(targetRole);
      const requiredSkills = jobListings.flatMap(job => job.requiredSkills);
      
      // Filter out skills that the user already has
      const missingSkills = requiredSkills.filter(
        skill => !currentSkills.some(
          currentSkill => currentSkill.toLowerCase() === skill.toLowerCase()
        )
      );

      return missingSkills;
    } catch (error) {
      console.error('Error analyzing skills:', error);
      throw new Error('Failed to analyze skills');
    }
  }
} 