import pool from "../lib/conn.js";

/**
 * Create a new review
 */
export async function createReview(productId, userId, stars, review) {
  const result = await pool.query(
    `INSERT INTO reviews (id_product, id_user, stars, review)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [productId, userId, stars, review]
  );
  return result.rows[0];
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId) {
  const result = await pool.query(
    `SELECT * FROM reviews WHERE id = $1`,
    [reviewId]
  );
  return result.rows[0];
}

/**
 * Update review
 */
export async function updateReview(reviewId, stars, review) {
  const result = await pool.query(
    `UPDATE reviews
     SET stars = $1, review = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [stars, review, reviewId]
  );
  return result.rows[0];
}

/**
 * Delete review
 */
export async function deleteReview(reviewId) {
  const result = await pool.query(
    `DELETE FROM reviews WHERE id = $1 RETURNING *`,
    [reviewId]
  );
  return result.rows[0];
}

/**
 * Get all reviews for a product with user name
 */
export async function getReviewsByProduct(productId, limit = 10, offset = 0) {
  const query = `
    SELECT r.id, r.stars, r.review, r.created_at, r.updated_at,
           u.id as user_id, u.email, p.name as user_name
    FROM reviews r
    JOIN users u ON r.id_user = u.id
    JOIN profiles p ON u.id = p.id_user
    WHERE r.id_product = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [productId, limit, offset]);
  return result.rows;
}

/**
 * Get average rating and total reviews for a product
 */
export async function getProductRatingStats(productId) {
  const result = await pool.query(
    `SELECT 
       COALESCE(AVG(stars), 0)::float as avg_rating,
       COUNT(*) as total_reviews
     FROM reviews
     WHERE id_product = $1`,
    [productId]
  );
  return result.rows[0];
}

/**
 * Check if user has already reviewed a product
 */
export async function hasUserReviewed(productId, userId) {
  const result = await pool.query(
    `SELECT id FROM reviews WHERE id_product = $1 AND id_user = $2`,
    [productId, userId]
  );
  return result.rows.length > 0;
}