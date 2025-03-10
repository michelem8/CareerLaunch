#!/bin/bash

# Build the client
npm run build

# Create a temporary deployment directory
mkdir -p ../deploy-client
cp -r dist/* ../deploy-client/
cp vercel.json ../deploy-client/

# Deploy from the deployment directory
cd ../deploy-client
vercel deploy --prod -y

# Clean up
cd ..
rm -rf deploy-client 