import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeResume(resumeText: string) {
  try {
    console.log("Analyzing resume with OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the resume and extract key information. Return results in JSON format with the following structure: { skills: string[], experience: string[], education: string[], suggestedRoles: string[] }"
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

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSkillGapAnalysis(
  currentSkills: string[],
  targetRole: string
) {
  try {
    console.log("Getting skill gap analysis...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the skill gap between current skills and target role. Return results in JSON format with the following structure: { missingSkills: string[], recommendations: string[] }"
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

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    throw new Error(`Failed to analyze skill gap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}