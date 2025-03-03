import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OpenAI } from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

console.log('Current directory:', __dirname);
console.log('Environment variables loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);

try {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('OpenAI client created successfully');
} catch (error) {
  console.error('Error creating OpenAI client:', error.message);
} 