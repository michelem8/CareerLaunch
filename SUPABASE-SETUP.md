# Supabase Setup for CareerLaunch

This guide provides step-by-step instructions for setting up and using Supabase as the database backend for CareerLaunch.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (v7 or later)
- A Supabase account (free tier is sufficient)

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project with a name of your choice (e.g., "careerpathfinder")
3. Make note of the project URL and API keys (you'll need them later)

### 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. For client-side, copy the client's `.env.example` to a new `.env.local` file:
   ```bash
   cp client/.env.example client/.env.local
   ```

4. Update the client `.env.local` file with your Supabase public information:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 3. Run Migrations to Set Up Database Schema

Run the migration script to create all necessary tables in your Supabase database:

```bash
./test-supabase.sh
```

This script will:
1. Check for the presence of `.env` file
2. Install dependencies if needed
3. Build the TypeScript files
4. Run the database migrations
5. Test the Supabase connection

### 4. Schema and Tables

The migration will create the following tables:

1. **user_profiles**: Stores user information
   - `id`: Auto-incrementing ID
   - `user_id`: Unique user identifier
   - `username`: User's username
   - `password`: User's password (in a real production app, this should be properly hashed)
   - `current_role`: User's current job role
   - `target_role`: User's target job role
   - `skills`: Array of user's skills
   - `preferences`: User preferences as JSON
   - `has_completed_survey`: Boolean indicating if user completed the survey
   - `survey_step`: Current step in the survey process

2. **resume_analysis**: Stores the results of resume analysis
   - `id`: Auto-incrementing ID
   - `user_id`: Reference to user_profiles.user_id
   - `skills`: Skills extracted from resume
   - `missing_skills`: Skills identified as missing
   - `recommendations`: Recommendations for skill improvement
   - `suggested_roles`: Suggested roles based on skills
   - `experience`: Work experience extracted from resume
   - `education`: Education history extracted from resume

3. **courses**: Stores course information
   - `id`: Auto-incrementing ID
   - `title`: Course title
   - `description`: Course description
   - `platform`: Learning platform (e.g., Coursera, Udemy)
   - `difficulty`: Course difficulty level
   - `duration`: Expected completion time
   - `skills`: Skills taught in the course
   - `url`: Course URL
   - `price`: Course price
   - `rating`: Course rating
   - `ai_match_score`: AI-calculated match score for recommendations

## Using the Supabase Backend

The application is configured to use Supabase in production mode and a memory store in development mode by default. To change this behavior:

1. To force Supabase in development, update `server/storage.ts`:
   ```typescript
   export const storage = new SupabaseStorage();
   ```

2. To check database connection status in the client, add the `DbStatusIndicator` component to your app:
   ```jsx
   import DbStatusIndicator from './components/DbStatusIndicator';
   
   function App() {
     return (
       <div>
         {/* Your app content */}
         <DbStatusIndicator />
       </div>
     );
   }
   ```

## Troubleshooting

### Connection Issues

If you're having trouble connecting to Supabase:

1. Verify your environment variables are correctly set
2. Check if your IP is allowed in Supabase (under Project Settings > API)
3. Run the test script to diagnose connection issues:
   ```bash
   node dist/server/test-supabase.js
   ```

### Data Issues

If you're experiencing data issues:

1. Check the Supabase SQL Editor for direct database access
2. Verify table structure matches expected schema
3. Use the Supabase Dashboard to inspect data

## Development Workflow

1. Make changes to your code
2. Run tests to ensure changes work as expected:
   ```bash
   npm test
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The `DbStatusIndicator` will show connection status in the bottom-right corner

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Dashboard](https://app.supabase.com) 