import { apiRequest } from './queryClient';

// API handler for OpenAI requests
export async function handleAIRequest(path: string, body: any) {
  try {
    // Forward the request to our backend API
    const response = await apiRequest('POST', `/api/ai/${path}`, body);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error (${response.status}): ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in AI API request:', error);
    throw error;
  }
}

// API endpoint for career recommendations
export async function getCareerRecommendations(skills: string[]) {
  return handleAIRequest('recommendations', { skills });
}

// API endpoint for course recommendations
export async function getCourseRecommendations(skills: string[]) {
  const queryParams = new URLSearchParams();
  skills.forEach(skill => queryParams.append('skills', skill));
  
  try {
    const response = await apiRequest('GET', `/api/courses/recommended?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch course recommendations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    throw error;
  }
} 