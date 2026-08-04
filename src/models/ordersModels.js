import pool from "../lib/conn.js";

/**
 * Create a new order
 */
export async function createOrder(data) {
  const {
    id_cart,
    id_shipping,
    id_payment,
    id_voucher,
    address,
    subtotal,
    discount,
    shipping_cost,
    total_payment,
  } = data;

  const result = await pool.query(
    `INSERT INTO orders 
     (id_cart, id_shipping, id_payment, id_voucher, address, subtotal, discount, shipping_cost, total_payment, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
     RETURNING *`,
    [id_cart, id_shipping, id_payment, id_voucher, address, subtotal, discount, shipping_cost, total_payment]
  );
  return result.rows[0];
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId) {
  const query = `
    SELECT o.*, 
           ms.name as shipping_name, ms.price as shipping_price,
           mp.name as payment_name, mp.payment_type
    FROM orders o
    JOIN carts c ON o.id_cart = c.id
    JOIN method_shippings ms ON o.id_shipping = ms.id
    JOIN methods_payments mp ON o.id_payment = mp.id
    WHERE c.id_user = $1
    ORDER BY o.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Get order by ID with user verification
 */
export async function getOrderById(orderId, userId) {
  const query = `
    SELECT o.*, 
           ms.name as shipping_name, ms.price as shipping_price,
           mp.name as payment_name, mp.payment_type,
           v.code as voucher_code, v.type as voucher_type, v.value as voucher_value
    FROM orders o
    JOIN carts c ON o.id_cart = c.id
    JOIN method_shippings ms ON o.id_shipping = ms.id
    JOIN methods_payments mp ON o.id_payment = mp.id
    LEFT JOIN vouchers v ON o.id_voucher = v.id
    WHERE o.id = $1 AND c.id_user = $2
  `;
  const result = await pool.query(query, [orderId, userId]);
  return result.rows[0];
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  const result = await pool.query(
    'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, orderId]
  );
  return result.rows[0];
}