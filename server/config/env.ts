import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
const envPath = resolve(__dirname, '../../.env');
console.log('Loading .env file from:', envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Set environment variables manually if needed
process.env.RAPID_API_KEY = process.env.RAPID_API_KEY || '0b2ef07ff2msh5d5d2b6d02da828p1f46a0jsn4d3879c8eeb7';
process.env.RAPID_API_HOST = process.env.RAPID_API_HOST || 'linkedin-data-api.p.rapidapi.com';

// Log environment variables
console.log('Environment variables loaded:');
console.log('RAPID_API_KEY:', process.env.RAPID_API_KEY ? `${process.env.RAPID_API_KEY.slice(0, 5)}...` : 'Not Set');
console.log('RAPID_API_HOST:', process.env.RAPID_API_HOST || 'Not Set');
console.log('Current working directory:', process.cwd());
console.log('Env file path:', envPath);

// Validate environment variables
if (!process.env.RAPID_API_KEY || !process.env.RAPID_API_HOST) {
  console.error('Error: Missing required environment variables');
  console.error('RAPID_API_KEY:', process.env.RAPID_API_KEY ? 'Set' : 'Not Set');
  console.error('RAPID_API_HOST:', process.env.RAPID_API_HOST ? 'Set' : 'Not Set');
  process.exit(1);
}

export const env = {
  RAPID_API_KEY: process.env.RAPID_API_KEY,
  RAPID_API_HOST: process.env.RAPID_API_HOST
}; 