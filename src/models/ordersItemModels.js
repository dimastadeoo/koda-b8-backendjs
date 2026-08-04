import pool from "../lib/conn.js";

/**
 * Create order items from cart items
 */
export async function createOrderItems(orderId, items) {
  if (!items || items.length === 0) return [];

  // Build dynamic query
  const values = items.map((_, i) => 
    `($${i*5+1}, $${i*5+2}, $${i*5+3}, $${i*5+4}, $${i*5+5})`
  ).join(',');

  const params = [];
  items.forEach(item => {
    params.push(orderId, item.id_product, item.product_name_snapshot, item.price_snapshot, item.qty);
  });

  const query = `
    INSERT INTO order_items (id_order, id_product, product_name_snapshot, price_snapshot, qty)
    VALUES ${values}
    RETURNING *
  `;
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get order items by order ID
 */
export async function getOrderItems(orderId) {
  const result = await pool.query(
    'SELECT * FROM order_items WHERE id_order = $1',
    [orderId]
  );
  return result.rows;
}