#!/bin/bash

# Build the client locally
echo "Building client..."
cd client
npm run build

# Navigate to the dist directory and deploy
echo "Deploying to Vercel..."
cd dist
vercel --prod --yes

echo "Deployment completed!" 