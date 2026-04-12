import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = postgres(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/backlog_manager');

const migrations = [
  '001_initial_schema.sql',
  '002_seed_achievements.sql',
  '003_hltb_cache.sql',
  '004_add_users.sql',
  '005_play_sessions.sql',
  '006_session_achievements.sql',
];

async function migrate() {
  for (const file of migrations) {
    const sqlText = readFileSync(join(__dirname, 'migrations', file), 'utf8');
    console.log(`Running migration: ${file}`);
    await sql.unsafe(sqlText);
    console.log(`  ✓ ${file}`);
  }
  await sql.end();
  console.log('All migrations complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
