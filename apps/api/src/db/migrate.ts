import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/bexo';
  console.log('Running migrations on:', databaseUrl.split('@')[1] || 'localhost');

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    
    const migrationSqlPath = path.join(__dirname, 'migrations.sql');
    console.log('Reading migration file:', migrationSqlPath);
    const sql = fs.readFileSync(migrationSqlPath, 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sql);
    console.log('Migrations executed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
