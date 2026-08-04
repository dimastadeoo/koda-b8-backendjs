import pool from "../lib/conn.js";

export async function createAddress(profileId, data) {
    const { label, receiver_name, detail_address, province, city, district, village, is_primary = false } = data;

    const result = await pool.query(
        `INSERT INTO address 
         (id_profile, label, receiver_name, detail_address, province, city, district, village, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [profileId, label, receiver_name, detail_address, province, city, district, village, is_primary]
    );
    return result.rows[0];
}

export async function updateAddress(id, data) {
    const { label, receiver_name, detail_address, province, city, district, village, is_primary } = data;
    const result = await pool.query(
        `UPDATE address SET
            label = COALESCE($1, label),
            receiver_name = COALESCE($2, receiver_name),
            detail_address = COALESCE($3, detail_address),
            province = COALESCE($4, province),
            city = COALESCE($5, city),
            district = COALESCE($6, district),
            village = COALESCE($7, village),
            is_primary = COALESCE($8, is_primary),
            updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [label, receiver_name, detail_address, province, city, district, village, is_primary, id]
    );
    return result.rows[0];
}

export async function findAddressesByProfileId(profileId) {
    const result = await pool.query(
        'SELECT * FROM address WHERE id_profile = $1 ORDER BY is_primary DESC, created_at DESC',
        [profileId]
    );
    return result.rows;
}

export async function findAddressById(id) {
    const result = await pool.query('SELECT * FROM address WHERE id = $1', [id]);
    return result.rows[0];
}

export async function deleteAddress(id) {
    const result = await pool.query('DELETE FROM address WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
}

export async function findPrimaryAddress(profileId) {
    const result = await pool.query(
        'SELECT * FROM address WHERE id_profile = $1 AND is_primary = true',
        [profileId]
    );
    return result.rows[0];
}

export async function unsetPrimaryAddress(profileId) {
    await pool.query(
        'UPDATE address SET is_primary = false WHERE id_profile = $1 AND is_primary = true',
        [profileId]
    );
}


