# Vercel Deployment Guide for CareerLaunch

## Function Limit Issue

Vercel's Hobby plan has a limit of 12 serverless functions per deployment. Our application has been refactored to work within this limitation.

## How We Solved It

1. We consolidated multiple utility endpoints into a single `api/utils.ts` file:
   - `/api/hello.ts`
   - `/api/test.ts`
   - `/api/cors-test.ts` 
   - `/api/openai-status.ts`

2. We've updated the `.vercelignore` file to exclude these original files.

3. Client-side code in `client/src/lib/api-route.ts` has been updated to use the new consolidated endpoints.

## Before Deploying

Ensure these files are committed to your repository:
- `api/utils.ts` (the consolidated endpoint)
- `.vercelignore` (to exclude the original files)
- Updated client code

## Deployment Steps

1. Push the changes to your GitHub repository
2. Connect your repo to Vercel if not already connected
3. Deploy using Vercel's dashboard or CLI

## Testing After Deployment

Verify that these endpoints work:
- `/api/utils/hello`
- `/api/utils/test`
- `/api/utils/cors-test`
- `/api/utils/openai-status`
- `/api/utils/health`

## Troubleshooting

If you still encounter the function limit error:
1. Check if you have any other API routes that could be consolidated
2. Consider moving to the Vercel Pro plan if you need more functions
3. Make sure your `.vercelignore` file is being respected

## Further Function Reduction (If Needed)

If you still need to reduce functions, consider:
1. Consolidating similar endpoints in other areas of your API
2. Moving rarely-used functionality to the client side
3. Using a more monolithic API approach versus many small functions 