# Production OpenAI Setup Guide

This guide provides step-by-step instructions for setting up the OpenAI integration in your production environment.

## Prerequisites

1. An OpenAI API key (obtain from [OpenAI Platform](https://platform.openai.com))
2. Access to your Vercel project settings (or other deployment platform)

## Setup Steps

### 1. Configure Environment Variables

Add the following environment variable to your production environment:

```
OPENAI_API_KEY=your_openai_api_key_here
```

In Vercel, you can set this under **Project Settings > Environment Variables**.

### 2. Deploy the API and Client

Ensure that all required files are deployed:

- `api/ai/index.ts` - Main AI API handler
- `api/ai/recommendations.ts` - Career recommendations handler
- `client/src/lib/ai-provider.ts` - OpenAI client configuration
- `client/src/lib/api-route.ts` - API route handlers

### 3. Verify Integration in Production

After deployment, verify that the integration is working:

1. Visit your production site
2. Navigate to the Career Dashboard
3. Confirm that recommendations are being populated
4. Check for the "AI Enhanced" badge next to recommendations
5. Use the API status endpoint to confirm connectivity: `/api/openai-status`

## Troubleshooting

If the OpenAI integration is not working in production:

1. **Check Environment Variables**: Verify that `OPENAI_API_KEY` is properly set in production.
2. **Inspect API Responses**: Check browser network tab for error responses from AI endpoints.
3. **Server Logs**: Review server logs for any errors related to OpenAI API calls.
4. **CORS Issues**: Ensure that your API is properly handling CORS for cross-origin requests.
5. **API Rate Limits**: Check if you've exceeded your OpenAI API rate limits.

## Implementation Details

### API Architecture

```
/api/ai/index.ts           # Main AI API handler
/api/ai/recommendations.ts # Career recommendations handler
/api/courses/recommended   # Course recommendations handler (existing)
```

### Client Integration 

```
/client/src/lib/ai-provider.ts  # OpenAI client configuration
/client/src/lib/api-route.ts    # API route handlers
```

### Working with the AI SDK

All OpenAI API calls are made server-side, with the client requesting recommendations through our API endpoints. This ensures:

1. API keys remain secure and are never exposed to the client
2. We can add caching, rate limiting, and other middleware
3. We maintain control over prompt engineering and costs

## Testing

Run the OpenAI integration tests to ensure the implementation is working:

```bash
cd client
npm run test -- src/__tests__/openai-integration.test.tsx
```

## Logging and Monitoring

In production, monitor your OpenAI API usage and costs through:

1. The OpenAI dashboard
2. Server logs for any errors or warnings
3. Client-side error monitoring

## Security Considerations

- Never expose your OpenAI API key in client-side code
- Implement rate limiting for your AI endpoints
- Consider adding authentication for sensitive AI operations
- Monitor for prompt injection attacks

## Updating the Integration

When updating the integration, always:

1. Write tests first
2. Test in development with your API key
3. Verify expected behavior in a staging environment 
4. Deploy to production
5. Monitor for any issues after deployment 