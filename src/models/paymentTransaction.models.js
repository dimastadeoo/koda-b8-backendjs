import pool from "../lib/conn.js";

export async function createPaymentTransaction(data) {
  const { id_order, id_method_payment, reference_number, amount } = data;
  const result = await pool.query(
    `INSERT INTO payment_transactions 
     (id_order, id_method_payment, reference_number, amount, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [id_order, id_method_payment, reference_number, amount]
  );
  return result.rows[0];
}

export async function updatePaymentTransactionStatus(transactionId, status, proofUrl = null) {
  const result = await pool.query(
    `UPDATE payment_transactions 
     SET status = $1, proof_url = COALESCE($2, proof_url), paid_at = CASE WHEN $1 = 'success' THEN NOW() ELSE paid_at END, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, proofUrl, transactionId]
  );
  return result.rows[0];
}