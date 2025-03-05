import OpenAI from "openai";
import { config } from "dotenv";
import path from "path";

// Ensure environment variables are loaded from the root directory
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading OpenAI configuration from:', envPath);
config({ path: envPath });

const apiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key:', apiKey ? `${apiKey.substring(0, 7)}...` : 'Not found');

if (!apiKey) {
  throw new Error("OpenAI API key is not configured");
}

if (!apiKey.startsWith('sk-')) {
  console.warn('Warning: OpenAI API key does not start with "sk-". This may cause authentication issues.');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' // Only allow in test environment
}); 