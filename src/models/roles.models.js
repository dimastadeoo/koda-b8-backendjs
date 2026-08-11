import pool from "../lib/conn.js";

export async function getRoleByName(name) {
  const result = await pool.query('SELECT * FROM roles WHERE name = $1', [name]);
  return result.rows[0];
}

export async function getRoleById(id) {
  const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getAllRoles() {
  const result = await pool.query('SELECT * FROM roles ORDER BY id');
  return result.rows;
}