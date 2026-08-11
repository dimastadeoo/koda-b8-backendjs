import pool from "../lib/conn.js";

/**
 * Add product to wishlist
 */
export async function addWishlist(profileId, productId) {
  const result = await pool.query(
    `INSERT INTO whishlists (id_profile, id_product)
     VALUES ($1, $2)
     ON CONFLICT (id_profile, id_product) DO NOTHING
     RETURNING *`,
    [profileId, productId]
  );
  return result.rows[0];
}

/**
 * Remove product from wishlist
 */
export async function removeWishlist(profileId, productId) {
  const result = await pool.query(
    `DELETE FROM whishlists
     WHERE id_profile = $1 AND id_product = $2
     RETURNING *`,
    [profileId, productId]
  );
  return result.rows[0];
}

/**
 * Get all wishlist items for a profile with product details
 */
export async function getWishlistByProfile(profileId) {
  const query = `
    SELECT 
      w.id_product,
      w.created_at as added_at,
      p.id, p.name, p.price, p.stock, p.description,
      m.id as merk_id, m.name as merk_name,
      (
        SELECT url_img FROM img_product 
        WHERE id_product = p.id AND is_primary = true 
        ORDER BY sort_order LIMIT 1
      ) as primary_image
    FROM whishlists w
    JOIN products p ON w.id_product = p.id
    LEFT JOIN merks m ON p.id_merk = m.id
    WHERE w.id_profile = $1
    ORDER BY w.created_at DESC
  `;
  const result = await pool.query(query, [profileId]);
  return result.rows;
}

/**
 * Check if a product is in user's wishlist
 */
export async function isInWishlist(profileId, productId) {
  const result = await pool.query(
    `SELECT 1 FROM whishlists WHERE id_profile = $1 AND id_product = $2`,
    [profileId, productId]
  );
  return result.rows.length > 0;
}