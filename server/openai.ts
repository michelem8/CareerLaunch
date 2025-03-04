import { openai } from "./openai-client";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function analyzeResume(resumeText: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

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
  * Training and Development Manager`,
        },
        {
          role: "user",
          content: resumeText,
        },
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
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
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      throw new Error("OpenAI API key is not configured");
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
        content: `You are a career transition expert specializing in technical roles. Analyze the gap between current skills and target role requirements, with special focus on career changes between different domains.

When analyzing transitions to software engineering roles, consider these key areas:
1. Core Programming Skills
   - Programming languages (e.g., Python, JavaScript, Java)
   - Data structures and algorithms
   - Object-oriented programming
   - Functional programming concepts

2. Software Development Practices
   - Version control (Git)
   - Testing methodologies
   - Debugging techniques
   - Code review practices
   - Clean code principles

3. Web Development (if relevant)
   - Frontend technologies (HTML, CSS, JavaScript frameworks)
   - Backend development
   - API design and implementation
   - Database management

4. Software Architecture & System Design
   - Design patterns
   - System architecture
   - Scalability and performance
   - Microservices
   - Cloud platforms (AWS, Azure, GCP)

5. Development Tools & Practices
   - IDE proficiency
   - Build tools
   - CI/CD pipelines
   - Agile methodologies
   - DevOps practices

Return results in JSON format:
{
  "missingSkills": string[],  // 5-7 most critical skills needed, ordered by priority
  "recommendations": string[]  // 5-7 specific, actionable learning steps with estimated timeframes
}

Focus on foundational skills first, then specialized technologies. Consider the user's current skills and experience when making recommendations.`
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      response_format: { type: "json_object" }
    });

    console.log("Raw OpenAI response:", JSON.stringify(response, null, 2));

    const content = response.choices[0].message.content;
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
    console.error("Error analyzing skill gap:", error);
    // Return empty arrays instead of throwing an error
    return {
      missingSkills: [],
      recommendations: []
    };
  }
}