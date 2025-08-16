#!/usr/bin/env node

/**
 * Script to run Supabase migrations
 * Usage: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  console.log('💡 Note: SUPABASE_SERVICE_KEY is your service role key from Supabase dashboard (Settings > API)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log('🚀 Running migration for uploaded_images table...\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20241209_create_uploaded_images_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    }).single();
    
    if (error) {
      // If RPC doesn't exist, try direct query (this might not work depending on permissions)
      console.log('⚠️  Cannot execute via RPC, please run the migration manually in Supabase SQL Editor');
      console.log('\n📋 Copy and paste this SQL in your Supabase SQL Editor:\n');
      console.log('----------------------------------------');
      console.log(migrationSQL);
      console.log('----------------------------------------\n');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/_/sql/new');
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 New table "uploaded_images" has been created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Please run the migration manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of supabase/migrations/20241209_create_uploaded_images_table.sql');
    console.log('4. Paste and run the SQL');
  }
}

runMigration();