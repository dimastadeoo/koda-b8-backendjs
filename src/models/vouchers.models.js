import pool from "../lib/conn.js";

export async function getValidVoucherByCode(code) {
  const result = await pool.query(
    `SELECT * FROM vouchers 
     WHERE code = $1 
       AND NOW() BETWEEN valid_from AND valid_until 
       AND quota > 0`,
    [code]
  );
  return result.rows[0];
}

export async function getVoucherById(id) {
  const result = await pool.query(
    'SELECT * FROM vouchers WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function decrementVoucherQuota(voucherId) {
  const result = await pool.query(
    'UPDATE vouchers SET quota = quota - 1 WHERE id = $1 AND quota > 0 RETURNING *',
    [voucherId]
  );
  return result.rows[0];
}