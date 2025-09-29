import { pool } from "../../../config/db.js";
import { normalizeUsername } from "../../utils/normalizeUsername.js";

export async function findUserByProvider(provider, providerId) {
  const res = await pool.query(
    "SELECT * FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1",
    [provider, providerId]
  );
  return res.rows[0];
}

export async function insertUser({
  provider,
  provider_id,
  email,
  username,
  picture,
}) {
  let usernameFinal = username || email.split("@")[0];
  usernameFinal = normalizeUsername(usernameFinal);
  const res = await pool.query(
    `INSERT INTO users (provider, provider_id, email, username, profile_image_url) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [provider, provider_id, email, usernameFinal, picture]
  );
  return res.rows[0];
}

export async function updateUserByProvider({
  provider,
  provider_id,
  email,
  username,
  picture,
}) {
  let usernameFinal = username || email.split("@")[0];
  usernameFinal = normalizeUsername(usernameFinal);
  const res = await pool.query(
    `UPDATE users 
     SET email = $3, username = $4, profile_image_url = $5, updated_at = NOW()
     WHERE provider = $1 AND provider_id = $2
     RETURNING *`,
    [provider, provider_id, email, usernameFinal, picture]
  );
  return res.rows[0];
}

/**
 * Cari user berdasarkan email (untuk login biasa)
 */
export async function findUserByEmail(email) {
  const res = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return res.rows[0];
}

/**
 * Insert user biasa (email + password)
 */
export async function insertUserWithPassword({
  email,
  username,
  hashedPassword,
}) {
  const res = await pool.query(
    `INSERT INTO users (email, username, password, provider) 
     VALUES ($1, $2, $3, 'local')
     RETURNING *`,
    [email, username, hashedPassword]
  );
  return res.rows[0];
}

/**
 * Update password user (opsional)
 */
export async function updateUserPassword(userId, hashedPassword) {
  const res = await pool.query(
    `UPDATE users 
     SET password = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, hashedPassword]
  );
  return res.rows[0];
}
