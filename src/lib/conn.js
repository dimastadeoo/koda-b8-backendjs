import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  // eslint-disable-next-line no-undef
  connectionString: process.env.DATABASE_URL,
  // eslint-disable-next-line no-undef
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

// Test koneksi (opsional)
pool.on('connect', () => {
  console.log('✅ Database pool connected');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

export default pool;