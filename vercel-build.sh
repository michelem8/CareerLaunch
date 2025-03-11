#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Install dependencies in the root directory
echo "Installing root dependencies..."
npm install

# Navigate to client directory and build
echo "Building client..."
cd client
npm install --include=dev
npm run build

# List the build output
echo "Build output:"
ls -la dist/ 