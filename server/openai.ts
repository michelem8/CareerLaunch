import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "default-key-for-development" });

export async function analyzeResume(resumeText: string) {
  try {
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

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume");
  }
}

export async function getSkillGapAnalysis(
  currentSkills: string[],
  targetRole: string
) {
  try {
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

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    throw new Error("Failed to analyze skill gap");
  }
}
