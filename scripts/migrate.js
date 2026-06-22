const { Client } = require('pg');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set — skipping migration');
    process.exit(0);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Running database migration…');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          bigint primary key generated always as identity,
        text        text not null,
        description text not null default '',
        user_id     text,
        completed   boolean not null default false,
        created_at  timestamptz not null default now(),
        updated_at  timestamptz
      );
    `);

    console.log('Migration complete — tasks table ready.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
