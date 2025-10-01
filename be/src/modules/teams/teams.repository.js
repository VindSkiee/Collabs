import { pool } from "../../../config/db.js";

/**
 * Membuat tim baru dan menjadikan owner sebagai LEADER dalam satu transaksi.
 * @param {object} teamData - Berisi { name }
 * @param {string} ownerId - UUID dari pengguna yang membuat tim
 * @returns {Promise<object>} Data tim yang baru dibuat
 */
export const create = async (teamData, ownerId) => {
  const client = await pool.connect();
  try {
    // Memulai transaksi
    await client.query("BEGIN");

    // Query 1: Masukkan data ke tabel 'teams'
    const teamQuery = {
      text: "INSERT INTO teams(name, owner_id) VALUES($1, $2) RETURNING *",
      values: [teamData.name, ownerId],
    };
    const teamResult = await client.query(teamQuery);
    const newTeam = teamResult.rows[0];

    // Query 2: Masukkan data ke tabel 'team_members' dengan peran LEADER
    const memberQuery = {
      text: `INSERT INTO team_members(user_id, team_id, role) VALUES($1, $2, 'LEADER')`,
      values: [ownerId, newTeam.id],
    };
    await client.query(memberQuery);

    // Menyelesaikan transaksi
    await client.query("COMMIT");
    return newTeam;
  } catch (error) {
    // Jika terjadi error, batalkan semua perubahan
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Mengembalikan koneksi ke pool
    client.release();
  }
};

/**
 * Menemukan semua tim yang diikuti oleh seorang pengguna.
 * @param {string} userId - UUID pengguna
 * @returns {Promise<Array>} Array berisi objek tim
 */
export const findAllByUserId = async (userId) => {
  const query = {
    text: `SELECT t.*, tm.role 
           FROM teams t
           JOIN team_members tm ON t.id = tm.team_id
           WHERE tm.user_id = $1`,
    values: [userId],
  };
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Menemukan satu tim berdasarkan ID-nya.
 * @param {string} teamId - UUID tim
 * @returns {Promise<object|null>} Objek tim atau null jika tidak ditemukan
 */
export const findById = async (teamId) => {
  const query = {
    text: "SELECT * FROM teams WHERE id = $1",
    values: [teamId],
  };
  const result = await pool.query(query);
  return result.rows[0] || null;
};

/**
 * Memperbarui nama tim.
 * @param {string} teamId - UUID tim
 * @param {object} teamData - Berisi { name }
 * @returns {Promise<object>} Data tim yang sudah diperbarui
 */
export const update = async (teamId, teamData) => {
  const query = {
    text: "UPDATE teams SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    values: [teamData.name, teamId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Menghapus sebuah tim.
 * @param {string} teamId - UUID tim
 */
export const remove = async (teamId) => {
  // Karena ada ON DELETE CASCADE di foreign key team_members,
  // anggota tim akan otomatis terhapus saat tim dihapus.
  const query = {
    text: "DELETE FROM teams WHERE id = $1",
    values: [teamId],
  };
  await pool.query(query);
};
