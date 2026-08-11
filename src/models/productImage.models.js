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

export async function insertProductImages(productId, images) {
  // images: array of { url_img, sort_order, is_primary, alt_text }
  if (!images || images.length === 0) return [];
  const values = images.map((img, i) => 
    `($${i*5+1}, $${i*5+2}, $${i*5+3}, $${i*5+4}, $${i*5+5})`
  ).join(',');
  const params = [];
  images.forEach(img => {
    params.push(productId, img.url_img, img.sort_order, img.is_primary, img.alt_text);
  });
  const query = `INSERT INTO img_product (id_product, url_img, sort_order, is_primary, alt_text) 
                 VALUES ${values} RETURNING *`;
  const result = await pool.query(query, params);
  return result.rows;
}

export async function deleteProductImages(productId) {
  const result = await pool.query(
    'DELETE FROM img_product WHERE id_product = $1 RETURNING *',
    [productId]
  );
  return result.rows;
}

export async function deleteImageById(imageId) {
  const result = await pool.query(
    'DELETE FROM img_product WHERE id = $1 RETURNING *',
    [imageId]
  );
  return result.rows[0];
}

export async function getImageById(imageId) {
  const result = await pool.query('SELECT * FROM img_product WHERE id = $1', [imageId]);
  return result.rows[0];
}