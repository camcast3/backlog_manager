import postgres from 'postgres';
import 'dotenv/config';

let _sql;

export function getDb() {
  if (!_sql) {
    _sql = postgres(
      process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/backlog_manager',
      { max: 10 }
    );
  }
  return _sql;
}

export default getDb;
