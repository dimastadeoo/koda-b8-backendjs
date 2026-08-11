import pool from "../lib/conn.js";

export async function findProfileByUserId(userId) {
  const result = await pool.query(
    `SELECT p.*, u.hp_number, u.email 
     FROM profiles p
     JOIN users u ON p.id_user = u.id
     WHERE p.id_user = $1`,
    [userId]
  );
  return result.rows[0];
}

// Tambahkan client parameter opsional
export async function createProfile(userId, name, client = null) {
  const db = client || pool;
  const result = await db.query(
    `INSERT INTO profiles (id_user, name)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, name]
  );
  return result.rows[0];
}

// Tambahkan client parameter opsional
export async function updateProfile(userId, data, client = null) {
  const db = client || pool;
  const { name, gender, place_birth, date_birth } = data;
  const result = await db.query(
    `UPDATE profiles 
     SET name = $1, gender = $2, place_birth = $3, date_birth = $4, updated_at = NOW()
     WHERE id_user = $5
     RETURNING *`,
    [name, gender, place_birth, date_birth, userId]
  );
  return result.rows[0];
}

export async function updateProfilePicture(userId, picture, client = null) {
  const db = client || pool;
  
  const result = await db.query(
    `UPDATE profiles 
     SET picture = $1, updated_at = NOW()
     WHERE id_user = $2
     RETURNING *`,
    [picture, userId]
  );
  return result.rows[0];
}
