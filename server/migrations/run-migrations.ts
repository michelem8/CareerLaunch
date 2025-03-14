import { supabase } from '../supabase-client';
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = __dirname;

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read all SQL files in this directory
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure they run in order
    
    console.log(`Found ${files.length} migration files to process`);
    
    // Process each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      
      // Read SQL content
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Run the SQL against Supabase
      const { error } = await supabase.rpc('run_sql', { query: sql });
      
      if (error) {
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
      
      console.log(`Successfully ran migration: ${file}`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 