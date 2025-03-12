# OpenAI Integration Setup for CareerLaunch

This document explains how to set up and verify the OpenAI integration for the CareerLaunch application, ensuring that the career dashboard uses the OpenAI recommendation engine in production instead of mock data.

## Prerequisites

1. An OpenAI API key - get one from [OpenAI's platform](https://platform.openai.com)
2. Access to the application's environment variables or deployment platform (like Vercel)

## Configuration Steps

### 1. Set Environment Variables

The OpenAI integration requires the following environment variable:

```
OPENAI_API_KEY=your_actual_api_key_here
```

Depending on your deployment platform, you can set this in:

- A `.env` file in the root directory for local development
- Environment variables in your hosting platform (Vercel, Netlify, etc.)
- CI/CD pipeline configuration

### 2. Verify OpenAI Integration

After setting up the environment variable and deploying your application, you can verify that the OpenAI integration is working correctly:

1. Visit the admin panel at `/admin` 
2. Click on "Check OpenAI API Status" to verify the API connection
3. If successful, you should see a "Connected" status with a test response

## Troubleshooting

If you're seeing mock data instead of OpenAI-generated recommendations:

1. **Check environment variables**: Ensure the `OPENAI_API_KEY` is properly set in your production environment
2. **Verify API connectivity**: Use the admin panel to check if the OpenAI API is accessible
3. **Check browser console**: Look for warnings about "mock data in production environment"
4. **Look at server logs**: Check for any error messages related to OpenAI API calls

## Implementation Details

The CareerLaunch application uses several mechanisms to ensure OpenAI is used in production:

1. The Vercel API handler (`api/courses/recommended.ts`) directly calls OpenAI for course recommendations
2. The service worker (`client/public/sw.js`) is configured to only use mock data in development mode
3. The API client (`client/src/lib/queryClient.ts`) only falls back to mock data in development
4. The CourseRecommendations component has built-in detection for mock data in production

## Development Mode vs. Production

- In development mode (`npm run dev`), mock data may be used as a fallback when OpenAI API is not available
- In production mode, the application should always use the OpenAI API and never fall back to mock data

## Testing OpenAI Integration

You can run the test suite to verify the OpenAI integration logic:

```bash
cd client
npm run test
```

Look for passing tests in the `openai-integration.test.ts` file. 