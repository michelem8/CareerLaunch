import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeResume(resumeText: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    console.log("Starting resume analysis...");

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Resume text is empty");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a resume analyzer. Extract key information from the resume in JSON format with the following structure: { skills: string[], experience: string[], education: string[], suggestedRoles: string[] }. Ensure all arrays contain at least one item, even if you need to make educated guesses based on the context."
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    console.log("Successfully analyzed resume:", parsedContent);
    return parsedContent;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    if (error instanceof Error) {
      // Handle rate limit error specifically
      if (error.message.includes("429") || error.message.includes("quota")) {
        throw new Error("Service is currently busy. Please try again in a few minutes.");
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
  targetRole: string
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    console.log("Starting skill gap analysis...");
    console.log("Current skills:", currentSkills);
    console.log("Target role:", targetRole);

    if (!targetRole) {
      throw new Error("Target role is required for skill gap analysis");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the skill gap between current skills and target role. Return results in JSON format with the following structure: { missingSkills: string[], recommendations: string[] }. Each array should contain at least 2-3 items."
        },
        {
          role: "user",
          content: `Current skills: ${currentSkills.join(", ")}\nTarget role: ${targetRole}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    console.log("Successfully analyzed skill gap:", parsedContent);
    return parsedContent;
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    if (error instanceof Error) {
      // Handle rate limit error specifically
      if (error.message.includes("429") || error.message.includes("quota")) {
        throw new Error("Service is currently busy. Please try again in a few minutes.");
      }
      if (error.message.includes("API key")) {
        throw new Error("Service configuration error. Please try again later.");
      }
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred during skill gap analysis");
  }
}