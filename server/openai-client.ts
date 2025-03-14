import OpenAI from "openai";
import { config } from "dotenv";
import path from "path";

// Ensure environment variables are loaded from the root directory
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading OpenAI configuration from:', envPath);
config({ path: envPath });

const apiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key Status:', apiKey ? 'Present' : 'Missing');
if (apiKey) {
  console.log('OpenAI API Key Format Check:', {
    length: apiKey.length,
    startsWithSk: apiKey.startsWith('sk-'),
    firstFiveChars: apiKey.substring(0, 5) + '...'
  });
}

// Warn about missing API key but don't throw an error
if (!apiKey) {
  console.warn("OpenAI API key is not configured. Using mock implementations where possible.");
}

if (apiKey && !apiKey.startsWith('sk-')) {
  console.warn('Warning: OpenAI API key does not start with "sk-". This may cause authentication issues.');
}

// Use a try/catch block to handle any initialization errors
let openaiClient = null;
try {
  if (apiKey) {
    // For OpenAI v4, we create the client directly
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
    console.log('OpenAI client successfully initialized');
  } else {
    console.log('OpenAI client not initialized due to missing API key');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

export const openai = openaiClient; 