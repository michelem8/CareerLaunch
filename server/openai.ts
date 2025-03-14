import { openai } from "./openai-client";
import type { ChatCompletionMessageParam } from "openai/resources";
// Interface for our chat messages - simplified for v3 compatibility
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function analyzeResume(resumeText: string) {
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      console.warn("OpenAI API key is not configured or client is not initialized");
      return {
        skills: [],
        experience: [],
        education: [],
        suggestedRoles: ["Software Engineer", "Web Developer", "Data Analyst"]
      };
    }

    // For OpenAI v4, we use chat.completions.create
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career advisor specializing in analyzing resumes and suggesting career paths. Extract key information from the resume and return it in JSON format with the following structure: { skills: string[], experience: string[], education: string[], suggestedRoles: string[] }. 

When suggesting roles, follow these guidelines:
1. Analyze the person's current skills, experience level, and job history
2. Suggest 3-5 roles that represent realistic next steps in their career progression
3. Include both lateral moves and upward transitions that build on their existing experience
4. Focus on roles that leverage their demonstrated skills and experience
5. Consider industry-specific transitions that match their background
6. Avoid suggesting senior technical roles (like Senior Product Manager) if they don't have relevant technical experience
7. Prioritize roles that align with their most recent work experience and skill set

For example:
- For someone with administrative and customer service experience, suggest roles like:
  * Office Manager
  * Operations Coordinator
  * Customer Success Manager
  * Account Manager
  * Administrative Team Lead

- For someone with retail management experience, suggest roles like:
  * District Manager
  * Retail Operations Manager
  * Customer Experience Manager
  * Sales Team Lead
  * Training and Development Manager

IMPORTANT: Please format your response as a valid JSON object with the keys: skills, experience, education, and suggestedRoles.`,
        },
        {
          role: "user",
          content: resumeText,
        },
      ] as ChatCompletionMessageParam[],
      response_format: { type: "json_object" }
    });

    // For OpenAI v4, the response format is different
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    return parsedContent;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    if (error instanceof Error) {
      // Handle rate limit error specifically
      if (error.message.includes("429") || error.message.includes("quota")) {
        throw new Error("OpenAI API quota exceeded. Please ensure your account has proper billing setup.");
      }
      if (error.message.includes("API key")) {
        throw new Error("Service configuration error. Please try again later.");
      }
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred during resume analysis");
  }
}

export async function getSkillGapAnalysis(
  currentSkills: string[],
  targetRole: string,
  user?: { currentRole?: string }
) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || !openai) {
      console.warn("OpenAI API key not found or client not initialized, using mock implementation for skill gap analysis");
      return getMockSkillGapAnalysis(currentSkills, targetRole, user);
    }

    console.log("Starting skill gap analysis...");
    console.log("Current skills:", currentSkills);
    console.log("Target role:", targetRole);
    console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Present" : "Missing");

    if (!targetRole) {
      throw new Error("Target role is required for skill gap analysis");
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a career development expert specializing in identifying skill gaps. Analyze the user's current skills and their target role to identify missing skills and provide actionable recommendations.

Please provide your response in the following JSON format:
{
  "missingSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

The "missingSkills" should be a list of specific technical or soft skills the person needs to develop to be competitive for the target role.
The "recommendations" should be specific, actionable steps they can take to develop those skills or otherwise prepare for the target role.

Guidelines:
1. Identify 4-6 specific missing skills that are most critical for the target role
2. Provide 4-6 specific recommendations for skill development
3. Focus on the highest-impact skills for the target role
4. Consider industry-standard technologies and methodologies
5. Include both technical and soft skills where relevant`
      },
      {
        role: "user",
        content: `Career Transition Analysis Request:

Current Role: ${user?.currentRole || "Unknown"}
Target Role: ${targetRole}

Current Skills and Experience:
${currentSkills.join(", ")}

Please provide a detailed analysis of:
1. What core technical skills are missing for the target role
2. Specific, actionable steps to acquire these skills
3. Consider which current skills might be transferable or provide a foundation for learning new skills
4. Prioritize recommendations based on the most critical skills needed for entry-level positions in the target role`
      }
    ];

    console.log("Sending request to OpenAI with messages:", JSON.stringify(messages, null, 2));

    // For OpenAI v4, we use chat.completions.create
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      response_format: { type: "json_object" }
    });

    console.log("Raw OpenAI response:", JSON.stringify(response, null, 2));

    // For OpenAI v4, the response format is different
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    console.log("OpenAI response content:", content);

    const parsedContent = JSON.parse(content);
    console.log("Successfully analyzed skill gap:", parsedContent);

    // Ensure we have both required fields
    const result = {
      missingSkills: parsedContent.missingSkills || [],
      recommendations: parsedContent.recommendations || []
    };

    console.log("Final skill gap result:", result);
    return result;
  } catch (error) {
    console.error("Error in skill gap analysis:", error);
    // Fallback to mock implementation if anything fails
    console.warn("Using mock implementation after error in OpenAI skill gap analysis");
    return getMockSkillGapAnalysis(currentSkills, targetRole, user);
  }
}

// Mock implementation for skill gap analysis
function getMockSkillGapAnalysis(
  currentSkills: string[],
  targetRole: string,
  user?: { currentRole?: string }
) {
  console.log("Using mock skill gap analysis");
  console.log("Current skills:", currentSkills);
  console.log("Target role:", targetRole);
  console.log("Current role:", user?.currentRole);
  
  // Define common skill gaps based on target role
  const skillGaps = {
    "Software Engineer": {
      missingSkills: [
        "Data Structures and Algorithms",
        "System Design",
        "Programming Languages (e.g., JavaScript, Python, Java)",
        "Git Version Control"
      ],
      recommendations: [
        "Practice coding problems on platforms like LeetCode or HackerRank",
        "Take a course on data structures and algorithms",
        "Build a personal project from scratch using popular frameworks",
        "Contribute to open-source projects to gain practical experience"
      ]
    },
    "Engineering Manager": {
      missingSkills: [
        "Technical Leadership",
        "Team Management",
        "Strategic Planning",
        "Stakeholder Communication"
      ],
      recommendations: [
        "Take a leadership course focused on technical teams",
        "Practice delegating technical tasks while maintaining oversight",
        "Develop stronger architecture and system design knowledge",
        "Work on communication skills for technical and non-technical audiences"
      ]
    },
    "Product Manager": {
      missingSkills: [
        "User Research",
        "Market Analysis",
        "Roadmap Planning",
        "Cross-functional Collaboration"
      ],
      recommendations: [
        "Take a product management certification course",
        "Practice writing product specifications and user stories",
        "Learn about user research methodologies",
        "Develop expertise in analytics and data-driven decision making"
      ]
    },
    "Data Scientist": {
      missingSkills: [
        "Statistical Analysis",
        "Machine Learning",
        "Python Programming",
        "Data Visualization"
      ],
      recommendations: [
        "Take courses on statistics and machine learning",
        "Practice with real-world datasets on Kaggle",
        "Learn popular data science libraries like pandas, scikit-learn, and TensorFlow",
        "Build a portfolio of data science projects"
      ]
    },
    "UX Designer": {
      missingSkills: [
        "User Research",
        "Wireframing",
        "Prototyping",
        "Visual Design"
      ],
      recommendations: [
        "Take courses on user-centered design principles",
        "Practice creating wireframes and prototypes",
        "Learn design tools like Figma or Sketch",
        "Build a portfolio of design projects"
      ]
    }
  };
  
  // Default skills and recommendations if target role is not in predefined list
  const defaultSkillGap = {
    missingSkills: [
      "Leadership Skills",
      "Technical Expertise",
      "Communication",
      "Problem Solving"
    ],
    recommendations: [
      "Focus on building expertise in your target field",
      "Take courses relevant to your target role",
      "Network with professionals in your target field",
      "Look for projects that can build relevant experience"
    ]
  };
  
  // Return predefined skill gap for known roles or default if unknown
  return skillGaps[targetRole as keyof typeof skillGaps] || defaultSkillGap;
}