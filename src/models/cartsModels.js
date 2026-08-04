import pool from "../lib/conn.js";

/**
 * Get or create cart for user
 */
export async function getOrCreateCart(userId) {
  // Cari cart yang sudah ada
  let result = await pool.query('SELECT id FROM carts WHERE id_user = $1', [userId]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // Buat cart baru
  result = await pool.query(
    'INSERT INTO carts (id_user) VALUES ($1) RETURNING id',
    [userId]
  );
  return result.rows[0];
}

/**
 * Get cart items with product details
 */
export async function getCartItems(cartId) {
  const query = `
    SELECT 
      cl.id_product,
      cl.qty,
      cl.status,
      cl.created_at as added_at,
      p.id, p.name as product_name, p.price, p.stock, p.description,
      m.id as merk_id, m.name as merk_name,
      (
        SELECT url_img FROM img_product 
        WHERE id_product = p.id AND is_primary = true 
        ORDER BY sort_order LIMIT 1
      ) as primary_image
    FROM carts_list cl
    JOIN products p ON cl.id_product = p.id
    LEFT JOIN merks m ON p.id_merk = m.id
    WHERE cl.id_cart = $1 AND cl.status = 'active'
    ORDER BY cl.created_at DESC
  `;
  const result = await pool.query(query, [cartId]);
  return result.rows;
}

/**
 * Add item to cart (or update qty if exists)
 */
export async function addItemToCart(cartId, productId, qty = 1) {
  // Cek apakah item sudah ada di cart
  const existing = await pool.query(
    'SELECT qty FROM carts_list WHERE id_cart = $1 AND id_product = $2 AND status = $3',
    [cartId, productId, 'active']
  );

  if (existing.rows.length > 0) {
    // Update qty
    const newQty = existing.rows[0].qty + parseInt(qty);
    const result = await pool.query(
      `UPDATE carts_list 
       SET qty = $1, updated_at = NOW() 
       WHERE id_cart = $2 AND id_product = $3 AND status = 'active'
       RETURNING *`,
      [newQty, cartId, productId]
    );
    return result.rows[0];
  } else {
    // Insert baru
    const result = await pool.query(
      `INSERT INTO carts_list (id_product, id_cart, qty, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [productId, cartId, qty]
    );
    return result.rows[0];
  }
}

/**
 * Update qty of item in cart
 */
export async function updateItemQty(cartId, productId, qty) {
  if (qty <= 0) {
    // Jika qty <= 0, hapus item
    return await removeItemFromCart(cartId, productId);
  }

  const result = await pool.query(
    `UPDATE carts_list 
     SET qty = $1, updated_at = NOW() 
     WHERE id_cart = $2 AND id_product = $3 AND status = 'active'
     RETURNING *`,
    [qty, cartId, productId]
  );
  return result.rows[0] || null;
}

/**
 * Remove item from cart (hard delete)
 */
export async function removeItemFromCart(cartId, productId) {
  const result = await pool.query(
    'DELETE FROM carts_list WHERE id_cart = $1 AND id_product = $2 RETURNING *',
    [cartId, productId]
  );
  return result.rows[0] || null;
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId) {
  await pool.query('DELETE FROM carts_list WHERE id_cart = $1', [cartId]);
}

/**
 * Update status of item (for checkout process)
 */
export async function updateItemStatus(cartId, productId, status) {
  const validStatus = ['active', 'not checked', 'checkout', 'sold out', 'not found'];
  if (!validStatus.includes(status)) {
    throw new Error('Invalid status');
  }

  const result = await pool.query(
    `UPDATE carts_list 
     SET status = $1, updated_at = NOW() 
     WHERE id_cart = $2 AND id_product = $3
     RETURNING *`,
    [status, cartId, productId]
  );
  return result.rows[0] || null;
}
