import pool from "../lib/conn.js";

/**
 * Get images for a product, sorted by sort_order
 */
export async function getProductImages(productId) {
  const result = await pool.query(
    `SELECT id, url_img, sort_order, is_primary, alt_text
     FROM img_product
     WHERE id_product = $1
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
  return result.rows;
}

/**
 * Get primary image for a product (fast lookup)
 */
export async function getPrimaryImage(productId) {
  const result = await pool.query(
    `SELECT url_img FROM img_product
     WHERE id_product = $1 AND is_primary = true
     LIMIT 1`,
    [productId]
  );
  return result.rows[0] || null;
}