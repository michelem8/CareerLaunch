#!/bin/bash

# Navigate to client directory
cd client

# Build the client
npm run build

# Create a temporary deployment directory
mkdir -p ../deploy
cp -r dist/* ../deploy/
cp vercel.json ../deploy/

# Deploy from the deployment directory
cd ../deploy
vercel --prod -y

# Clean up
cd ..
rm -rf deploy 