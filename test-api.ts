import { config } from 'dotenv';
import axios from 'axios';

// Load environment variables
config();

const apiKey = process.env.RAPID_API_KEY;
const host = process.env.RAPID_API_HOST;

console.log('Environment variables:');
console.log('RAPID_API_KEY:', apiKey ? `${apiKey.slice(0, 5)}...` : 'Not Set');
console.log('RAPID_API_HOST:', host || 'Not Set');

async function testAPI() {
  try {
    const response = await axios.get(`https://${host}/search-jobs-v2`, {
      params: {
        keywords: 'Golang Developer',
        locationId: '92000000',
        datePosted: 'anyTime',
        sort: 'mostRelevant'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI(); 