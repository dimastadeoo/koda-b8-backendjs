import pool from "../lib/conn.js";

export async function createShippingTracking(orderId, resiNumber = null, courierStatus = null, note = null) {
  const result = await pool.query(
    `INSERT INTO shipping_tracking (id_order, resi_number, courier_status, note)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orderId, resiNumber, courierStatus, note]
  );
  return result.rows[0];
}