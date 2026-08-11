import pool from "../lib/conn.js";

export async function getActivePaymentMethods() {
  const result = await pool.query(
    'SELECT id, name, payment_type FROM methods_payments WHERE is_active = true ORDER BY name'
  );
  return result.rows;
}

export async function getPaymentMethodById(id) {
  const result = await pool.query(
    'SELECT id, name, payment_type FROM methods_payments WHERE id = $1 AND is_active = true',
    [id]
  );
  return result.rows[0];
}