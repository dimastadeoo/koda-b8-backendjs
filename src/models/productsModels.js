import pool from "../lib/conn.js";

// get data dengan paging, searcing, filter, sort, 
export async function getProducts({ filters, search, sort, limit, offset }) {
  // --- 1. Bangun WHERE clause dan nilai parameter ---
  const whereClauses = [];
  const values = [];
  let paramCount = 1;

  // Filter kategori
  if (filters.category) {
    whereClauses.push(
      `EXISTS (SELECT 1 FROM product_categorie pc2 WHERE pc2.id_product = p.id AND pc2.id_categorie = $${paramCount})`
    );
    values.push(filters.category);
    paramCount++;
  }

  // Filter merk
  if (filters.merk) {
    whereClauses.push(`p.id_merk = $${paramCount}`);
    values.push(filters.merk);
    paramCount++;
  }

  // Filter harga minimum
  if (filters.min_price !== null && filters.min_price !== undefined) {
    whereClauses.push(`p.price >= $${paramCount}`);
    values.push(filters.min_price);
    paramCount++;
  }

  // Filter harga maksimum
  if (filters.max_price !== null && filters.max_price !== undefined) {
    whereClauses.push(`p.price <= $${paramCount}`);
    values.push(filters.max_price);
    paramCount++;
  }

  // Search by product name
  if (search.name) {
    whereClauses.push(`p.name ILIKE $${paramCount}`);
    values.push(`%${search.name}%`);
    paramCount++;
  }

  // Search by merk name
  if (search.merk) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM merks m2 WHERE m2.id = p.id_merk AND m2.name ILIKE $${paramCount}
    )`);
    values.push(`%${search.merk}%`);
    paramCount++;
  }

  // Search by category name
  if (search.categorie) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM product_categorie pc3
      JOIN categories c3 ON pc3.id_categorie = c3.id
      WHERE pc3.id_product = p.id AND c3.name ILIKE $${paramCount}
    )`);
    values.push(`%${search.categorie}%`);
    paramCount++;
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // --- 2. Query data utama dengan JOIN dan aggregasi ---
  const mainQuery = `
    SELECT 
      p.id, p.name, p.price, p.stock, p.description, p.created_at, p.updated_at,
      m.id as merk_id, m.name as merk_name,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), 
        '[]'
      ) as categories,
      (
        SELECT url_img FROM img_product 
        WHERE id_product = p.id AND is_primary = true 
        ORDER BY sort_order LIMIT 1
      ) as primary_image,
      COALESCE(
        (SELECT AVG(stars) FROM reviews WHERE id_product = p.id), 0
      )::float as average_rating,
      COALESCE(
        (SELECT COUNT(*) FROM reviews WHERE id_product = p.id), 0
      )::int as total_reviews
    FROM products p
    LEFT JOIN merks m ON p.id_merk = m.id
    LEFT JOIN product_categorie pc ON p.id = pc.id_product
    LEFT JOIN categories c ON pc.id_categorie = c.id
    ${whereClause}
    GROUP BY p.id, m.id, m.name
    ORDER BY ${sort.field === 'price' ? 'p.price' : sort.field === 'name' ? 'p.name' : 'p.created_at'} ${sort.order}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  const dataValues = [...values, limit, offset];
  const dataResult = await pool.query(mainQuery, dataValues);

  // --- 3. Query count total (tanpa paginasi) ---
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN merks m ON p.id_merk = m.id
    LEFT JOIN product_categorie pc ON p.id = pc.id_product
    LEFT JOIN categories c ON pc.id_categorie = c.id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  return {
    data: dataResult.rows,
    total,
  };
}

/**
 * Get product by ID with specifications
 */
export async function getProductById(productId) {
  const query = `
    SELECT 
      p.id, p.name, p.price, p.stock, p.description, p.created_at, p.updated_at,
      m.id as merk_id, m.name as merk_name,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), 
        '[]'
      ) as categories,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('key', ps.key, 'value', ps.value)) 
        FILTER (WHERE ps.id IS NOT NULL), 
        '[]'
      ) as specifications
    FROM products p
    LEFT JOIN merks m ON p.id_merk = m.id
    LEFT JOIN product_categorie pc ON p.id = pc.id_product
    LEFT JOIN categories c ON pc.id_categorie = c.id
    LEFT JOIN product_specification ps ON p.id = ps.id_product
    WHERE p.id = $1
    GROUP BY p.id, m.id, m.name
  `;
  const result = await pool.query(query, [productId]);
  return result.rows[0] || null;
}

/**
 * Get all merks
 */
export async function getMerks() {
  const result = await pool.query('SELECT * FROM merks ORDER BY name');
  return result.rows;
}

/**
 * Get all categories
 */
export async function getCategories() {
  const result = await pool.query('SELECT * FROM categories ORDER BY name');
  return result.rows;
}