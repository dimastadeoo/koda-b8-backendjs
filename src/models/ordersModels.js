import pool from "../lib/conn.js";

/**
 * Create a new order
 */
export async function createOrder(data) {
  const {
    id_cart,
    status,
    checkout_step,
    subtotal
  } = data;

  const result = await pool.query(
    `INSERT INTO orders 
     (id_cart, status, checkout_step, subtotal)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_cart, status, checkout_step, subtotal ]
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
    LEFT JOIN carts c ON o.id_cart = c.id
    LEFT JOIN method_shippings ms ON o.id_shipping = ms.id
    LEFT JOIN methods_payments mp ON o.id_payment = mp.id
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
    LEFT JOIN carts c ON o.id_cart = c.id
    LEFT JOIN method_shippings ms ON o.id_shipping = ms.id
    LEFT JOIN methods_payments mp ON o.id_payment = mp.id
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

export async function updateOrder(orderId, data) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Build dynamic SET clause
  const allowedFields = ['id_shipping', 'id_payment', 'id_voucher', 'address', 'subtotal', 'discount', 'shipping_cost', 'total_payment', 'status', 'checkout_step'];
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(data[key]);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(orderId);
  const query = `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateOrderAddress(orderId, address) {
  const result = await pool.query(
    'UPDATE orders SET address = $1, checkout_step = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [address, 'address_set', orderId]
  );
  return result.rows[0];
}

export async function updateOrderShipping(orderId, shippingId) {
  const result = await pool.query(
    'UPDATE orders SET id_shipping = $1, checkout_step = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [shippingId, 'shipping_set', orderId]
  );
  return result.rows[0];
}

export async function updateOrderPayment(orderId, paymentId) {
  const result = await pool.query(
    'UPDATE orders SET id_payment = $1, checkout_step = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [paymentId, 'payment_set', orderId]
  );
  return result.rows[0];
}

export async function updateOrderVoucher(orderId, voucherId) {
  const result = await pool.query(
    `UPDATE orders SET id_voucher = $1, updated_at = NOW() 
     WHERE id = $2 RETURNING *`,
    [voucherId, orderId]
  );
  return result.rows[0];
}

export async function confirmOrder({orderId, subtotal, discount, shipping_cost, total_payment}) {
  const result = await pool.query(
    `UPDATE orders 
     SET subtotal = $1, discount = $2, shipping_cost = $3, total_payment = $4, 
         status = 'pending', checkout_step = 'confirmed', updated_at = NOW()
     WHERE id = $5 AND checkout_step = 'payment_set'
     RETURNING *`,
    [subtotal, discount, shipping_cost, total_payment, orderId]
  );
  return result.rows[0];
}