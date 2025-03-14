#!/bin/bash
# Script to test Supabase integration and run migrations

echo "🚀 CareerLaunch Supabase Setup and Testing Script"
echo "================================================="

# Check if the .env file exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create one based on .env.example"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the TypeScript files
echo "🔨 Building TypeScript files..."
npx tsc --project tsconfig.json

# Run migrations
echo "🗃️ Running database migrations..."
node dist/server/migrations/run-migrations.js

# Run the test
echo "🧪 Running Supabase integration tests..."
node dist/server/test-supabase.js

echo "✅ Setup and tests complete!" 