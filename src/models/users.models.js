import pool from "../lib/conn.js";

export async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createUser(email, password, id_role) {
  const result = await pool.query(
    'INSERT INTO users (email, password, id_role) VALUES ($1, $2, $3) RETURNING *',
    [email, password, id_role]
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

// Tambahkan di usersModels.js

export async function findUserWithRole(email) {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name 
     FROM users u 
     LEFT JOIN roles r ON u.id_role = r.id 
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
}

export async function findUserByIdWithRole(id) {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name 
     FROM users u 
     LEFT JOIN roles r ON u.id_role = r.id 
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function getAllUsersWithRole() {
  const result = await pool.query(
    `SELECT u.id, u.email, p.name, u.hp_number, u.created_at, u.updated_at,
            r.id as role_id, r.name as role_name,
            creator.email as created_by_email, p.name as created_by_name
     FROM users u
     LEFT JOIN profiles p ON p.id_user = u.id 
     LEFT JOIN roles r ON u.id_role = r.id 
     LEFT JOIN users creator ON u.created_by = creator.id
     ORDER BY u.created_at DESC`
  );
  return result.rows;
}

export async function createUserWithRole(email, password, hp_number = null, id_role, created_by = null) {
  const result = await pool.query(
    `INSERT INTO users (email, password, hp_number, id_role, created_by) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [email, password, hp_number, id_role, created_by]
  );
  return result.rows[0];
}

export async function updateUserRole(userId, id_role) {
  const result = await pool.query(
    'UPDATE users SET id_role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [id_role, userId]
  );
  return result.rows[0];
}

export async function updateUser(id, data) {
  const { email, hp_number, id_role } = data;
  const result = await pool.query(
    `UPDATE users 
     SET email = $1, hp_number = $2, id_role = $3, updated_at = NOW() 
     WHERE id = $4 RETURNING *`,
    [email, hp_number, id_role, id]
  );
  return result.rows[0];
}

export async function deleteUserById(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}