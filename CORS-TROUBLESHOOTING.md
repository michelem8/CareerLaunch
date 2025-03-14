# CORS Troubleshooting Guide

## Understanding the Issue

The application is encountering CORS (Cross-Origin Resource Sharing) issues when the frontend at `https://careerpathfinder.io` attempts to access the API at `https://careerpathfinder.io/api/test`. 

This happens because browsers enforce the Same-Origin Policy, which prevents web pages from making requests to domains different from the one that served the page.

## Changes Made to Fix the Issue

1. **Updated API Test Endpoint**: Modified `api/test.ts` to:
   - Detect the origin of the request
   - Allow requests from the correct domain
   - Send the appropriate CORS headers back in the response

2. **Fixed Client API URL Handling**: Updated `client/src/lib/api.ts` to:
   - Use relative URLs in production to avoid CORS issues
   - Handle domain scenarios correctly

3. **Updated Vercel Configuration**: Modified `vercel.json` to:
   - Set specific CORS headers for API routes
   - Added the `Vary: Origin` header to ensure proper caching behavior

4. **Added CORS Testing Tools**:
   - Created a CORS testing utility (`client/src/lib/cors-test.ts`)
   - Added a UI component for testing API connectivity
   - Integrated the test into the survey page with a toggle button

## How to Verify the Fix

1. Open the survey page
2. Click "Show API Test" button
3. Run the API connectivity test
4. Verify that the test passes

## Additional Recommendations

For a production environment, consider these additional improvements:

1. **Use the Same Domain for Frontend and API**: 
   - Ideally, serve both from the same domain to avoid CORS issues entirely
   - Standardize on `careerpathfinder.io` for all services

2. **Configure DNS and Redirects Properly**:
   - Set up proper redirects to ensure users always land on the canonical domain
   - Update all links to use the canonical domain

3. **Centralize CORS Configuration**:
   - Maintain CORS configuration in one place to avoid inconsistencies
   - Consider using environment variables for allowed origins

4. **Advanced CORS Handling for Production**:
   - For production, use a wildcard origin only when absolutely necessary
   - Always prefer an explicit list of allowed origins

## Troubleshooting Future Issues

If CORS issues reappear:

1. Check the browser console for specific error messages
2. Use the API Connectivity Test component to diagnose the issue
3. Verify that the correct CORS headers are being sent by the API (using browser developer tools)
4. Ensure that the frontend is using the correct URL format (relative vs absolute)
5. Check for any proxy or CDN configuration that might be affecting CORS headers

## Resources

- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel Documentation: CORS Headers](https://vercel.com/docs/concepts/functions/serverless-functions/cors) 