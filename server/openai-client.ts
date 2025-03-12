import OpenAI from "openai";
import { config } from "dotenv";
import path from "path";

// Ensure environment variables are loaded from the root directory
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading OpenAI configuration from:', envPath);
config({ path: envPath });

const apiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key:', apiKey ? `${apiKey.substring(0, 7)}...` : 'Not found');

// Warn about missing API key but don't throw an error
if (!apiKey) {
  console.warn("OpenAI API key is not configured. Using mock implementations where possible.");
}

if (apiKey && !apiKey.startsWith('sk-')) {
  console.warn('Warning: OpenAI API key does not start with "sk-". This may cause authentication issues.');
}

export const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' // Only allow in test environment
}) : null; 