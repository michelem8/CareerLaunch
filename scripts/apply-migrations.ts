import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL or service key not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

interface MigrationFile {
  path: string;
  name: string;
  order: number;
}

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read SQL files from both migration directories
    const migrationDirs = [
      path.join(process.cwd(), 'migrations'),      // Core schema migra tions first
      path.join(process.cwd(), 'server/migrations') // User-related schema migrations second
    ];

    // Collect all migration files
    const allMigrations: MigrationFile[] = [];

    for (const dir of migrationDirs) {
      if (!fs.existsSync(dir)) {
        console.log(`Migration directory ${dir} does not exist, skipping...`);
        continue;
      }

      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const order = parseInt(file.match(/^\d+/)?.[0] || '999');
          return {
            path: path.join(dir, file),
            name: file,
            order
          };
        });
      
      allMigrations.push(...files);
    }

    // Sort migrations by order number and then by name
    const sortedMigrations = allMigrations.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log(`Found ${sortedMigrations.length} total migration files to process`);
    
    // Process each migration
    for (const migration of sortedMigrations) {
      console.log(`Running migration: ${migration.name}`);
      
      // Read SQL content
      const sql = fs.readFileSync(migration.path, 'utf8');
      
      // Split the SQL file into individual statements
      const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      // Execute each statement
      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`Error running statement in ${migration.name}:`, error);
            console.error('Statement:', statement);
            throw error;
          }
        } catch (error: any) {
          if (error.message?.includes('already exists')) {
            console.warn(`Warning: Object already exists in ${migration.name}, continuing...`);
            continue;
          }
          throw error;
        }
      }
      
      console.log(`✅ Successfully ran migration: ${migration.name}`);
    }
    
    console.log('✅ All migrations completed successfully!');
    
    // Test connection and basic table existence
    const { data, error } = await supabase
      .from('test')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection test successful!');
      console.log('Test data:', data);
    }
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 