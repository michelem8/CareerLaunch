import OpenAI from "openai";
import { config } from "dotenv";
import path from "path";

// Ensure environment variables are loaded from the root directory
config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OpenAI API key is not configured");
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' // Only allow in test environment
}); 