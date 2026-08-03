import pool from "../lib/conn.js";

export async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createUser(email, password) {
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
    [email, password]
  );
  return result.rows[0];
}

export async function findById(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

// Tambahkan client parameter opsional
export async function findByNoHp(noHp, client = null) {
  const db = client || pool;
  const result = await db.query('SELECT * FROM users WHERE hp_number = $1', [noHp]);
  return result.rows[0];
}

// Tambahkan client parameter opsional
export async function updateUserPhone(userId, hp_number, client = null) {
  const db = client || pool;
  const result = await db.query(
    'UPDATE users SET hp_number = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, hp_number',
    [hp_number, userId]
  );
  return result.rows[0];
}

export async function updateUserPassword(userId, hashedPassword) {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
    [hashedPassword, userId]
  );
  return result.rows[0];
}

export async function updateUserEmail(userId, email) {
  const result = await pool.query(
    'UPDATE users SET email = $1 WHERE id = $2 RETURNING *',
    [email, userId]
  );
  return result.rows[0];
}