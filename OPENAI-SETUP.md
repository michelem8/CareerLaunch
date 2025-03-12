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

Alternatively, you can check the API status directly:

```
GET /api/openai-status
```

You should receive a response indicating that the API is properly configured.

## Testing the AI-Powered Recommendations

Once the OpenAI integration is configured, the career dashboard will automatically use AI-powered recommendations in production mode. You can test this by:

1. Visiting the career dashboard
2. Looking for the "AI Enhanced" badge next to the recommendations section
3. Verifying that the recommendations are dynamic and personalized

## Troubleshooting

If you're seeing mock data instead of OpenAI-generated recommendations:

1. **Check environment variables**: Ensure the `OPENAI_API_KEY` is properly set in your production environment
2. **Verify API connectivity**: Use the admin panel to check if the OpenAI API is accessible
3. **Check browser console**: Look for warnings about "mock data in production environment"
4. **Look at server logs**: Check for any error messages related to OpenAI API calls
5. **Examine API status**: Navigate to `/api/ai` to see information about available AI endpoints

## Implementation Details

The CareerLaunch application uses several mechanisms to ensure OpenAI is used in production:

1. The client uses the OpenAI SDK through our middleware to make recommendations more secure
2. The API handlers (`api/ai/recommendations.ts` and `api/courses/recommended.ts`) directly call OpenAI for recommendations
3. The service worker is configured to only use mock data in development mode
4. The API client falls back to mock data only in development
5. Both `CareerDashboard` and `CourseRecommendations` components have built-in detection for mock data in production

## Development Mode vs. Production

- In development mode (`npm run dev`), mock data may be used as a fallback when OpenAI API is not available
- In production mode, the application should always use the OpenAI API and never fall back to mock data

### Production AI Workflow

1. The client sends a request to our API endpoints
2. Our server-side API handlers securely call OpenAI with the API key
3. Results are returned to the client and displayed in the UI
4. No API keys are exposed to the client

## Testing OpenAI Integration

You can run the test suite to verify the OpenAI integration logic:

```bash
cd client
npm run test
```

Look for passing tests in the `openai-integration.test.ts` file.

## API Reference

The following AI API endpoints are available:

- `GET /api/ai` - Information about available AI endpoints
- `POST /api/ai/recommendations` - Generate career recommendations based on skill gaps
  - Body: `{ "skills": ["skill1", "skill2"] }`
- `GET /api/courses/recommended?skills=skill1&skills=skill2` - Get course recommendations 