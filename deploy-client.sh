#!/bin/bash

# Build the client locally
echo "Building client..."
npm run build

# Create a minimal vercel.json for static deployment
echo "Creating minimal Vercel configuration..."
cat > dist/vercel.json << EOL
{
  "version": 2,
  "cleanUrls": true
}
EOL

# Deploy directly from the dist directory
echo "Deploying to Vercel..."
vercel --prod -y dist --static

echo "Deployment completed!" 