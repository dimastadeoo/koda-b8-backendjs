import pool from "../lib/conn.js";

export async function getActiveShippingMethods() {
  const result = await pool.query(
    'SELECT id, name, price FROM method_shippings ORDER BY price'
  );
  return result.rows;
}

export async function getShippingMethodById(id) {
  const result = await pool.query(
    'SELECT id, name, price FROM method_shippings WHERE id = $1',
    [id]
  );
  return result.rows[0];
}