import { openai } from "./openai-client";
// Remove specific import and use a more generic interface
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

    const messages: ChatMessage[] = [
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