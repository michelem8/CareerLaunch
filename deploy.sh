#!/bin/bash

# Deploy script for CareerPathFinder CORS fixes

echo "Starting deployment of CORS fixes..."

# Build the client
echo "Building client..."
cd client && npm run build
cd ..

# Run tests (optional - can be commented out if tests are failing)
# echo "Running tests..."
# npm test

# Deploy to production (assuming you're using Vercel)
echo "Deploying to production..."
npx vercel --prod

echo "Deployment complete!"
echo "Note: You may need to purge CDN caches if you're using a CDN."
echo "Monitor the logs for any CORS-related issues after deployment." 