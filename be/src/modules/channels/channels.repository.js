import { pool } from "../../../config/db.js";

// Membuat channel & menjadikan kreator sebagai LEADER
export const createChannel = async (data, client) => {
  const channelQuery = {
    text: `INSERT INTO channels(team_id, creator_id, name, topic, type, status)
           VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    values: [
      data.teamId,
      data.creatorId,
      data.name,
      data.topic,
      data.type,
      data.status,
    ],
  };
  const channelResult = await client.query(channelQuery);
  const newChannel = channelResult.rows[0];

  const memberQuery = {
    text: `INSERT INTO channel_members(user_id, channel_id, role) VALUES($1, $2, 'LEADER')`,
    values: [data.creatorId, newChannel.id],
  };
  await client.query(memberQuery);

  return newChannel;
};

// Menampilkan channel di dalam tim berdasarkan peran user
export const findAllChannelsByTeamId = async (
  teamId,
  userTeamRole,
  isOwner = false
) => {
  const query = {
    text: `
        SELECT * FROM channels
        WHERE team_id = $1
        -- Logika filter: Tampilkan channel jika...
        AND (
          type = 'PUBLIC'          -- ...channelnya PUBLIC, ATAU
          OR $2 = 'LEADER'         -- ...pengguna adalah LEADER di tim, ATAU
          OR $3 = TRUE             -- ...pengguna adalah OWNER tim
        )
        ORDER BY created_at ASC
      `,
    values: [teamId, userTeamRole, isOwner],
  };
  const result = await pool.query(query);
  return result.rows;
};

export const findChannelById = async (channelId) => {
  const result = await pool.query("SELECT * FROM channels WHERE id = $1", [
    channelId,
  ]);
  return result.rows[0];
};

// Menambahkan member ke channel
// Menambahkan member ke channel, menerima role dinamis
export const addChannelMember = async (channelId, userId, role = "MEMBER") => {
  const query = {
    text: `INSERT INTO channel_members(user_id, channel_id, role) VALUES($1, $2, $3)
           ON CONFLICT (user_id, channel_id) DO UPDATE SET role = EXCLUDED.role
           RETURNING *`,
    values: [userId, channelId, role],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

// Menghapus member dari channel
export const removeChannelMember = async (channelId, userId) => {
  await pool.query(
    "DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2",
    [channelId, userId]
  );
};

// Update peran member di channel
export const updateChannelMemberRole = async (channelId, userId, newRole) => {
  const query = {
    text: `UPDATE channel_members SET role = $1 WHERE channel_id = $2 AND user_id = $3 RETURNING *`,
    values: [newRole, channelId, userId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

// Hapus channel
export const removeChannel = async (channelId) => {
  await pool.query("DELETE FROM channels WHERE id = $1", [channelId]);
};

// Update nama dan topik channel
export const updateChannelDetails = async (channelId, data) => {
  const query = {
    text: `UPDATE channels SET name = $1, topic = $2 WHERE id = $3 RETURNING *`,
    values: [data.name, data.topic, channelId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

// Update pengaturan channel
export const updateChannelSettings = async (channelId, settings) => {
  const { chat_mode, status } = settings;
  const query = {
    text: `UPDATE channels SET chat_mode = $1, status = $2 WHERE id = $3 RETURNING *`,
    values: [chat_mode, status, channelId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

// Simpan pesan ke database
export const createChannelMessage = async (data) => {
  const { channelId, userId, content } = data;
  const query = {
    text: "INSERT INTO messages(channel_id, user_id, content) VALUES($1, $2, $3) RETURNING *",
    values: [channelId, userId, content],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

export const findChannelMember = async (channelId, userId) => {
  const query = {
    text: "SELECT * FROM channel_members WHERE channel_id = $1 AND user_id = $2",
    values: [channelId, userId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Membuat permintaan untuk bergabung ke channel.
 * @param {string} channelId
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const createJoinRequest = async (channelId, userId) => {
  const query = {
    text: `INSERT INTO channel_join_requests(channel_id, user_id) VALUES($1, $2)
           ON CONFLICT (channel_id, user_id) DO NOTHING
           RETURNING *`,
    values: [channelId, userId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Menemukan semua permintaan yang masih PENDING untuk sebuah channel.
 * @param {string} channelId
 * @returns {Promise<Array>}
 */
export const findPendingRequestsByChannel = async (channelId) => {
  const query = {
    text: `SELECT cjr.*, u.username, u.email 
           FROM channel_join_requests cjr
           JOIN users u ON cjr.user_id = u.id
           WHERE cjr.channel_id = $1 AND cjr.status = 'PENDING'`,
    values: [channelId],
  };
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Menemukan satu permintaan join berdasarkan ID-nya.
 * @param {string} requestId
 * @returns {Promise<object|null>}
 */
export const findJoinRequestById = async (requestId) => {
  const result = await pool.query(
    "SELECT * FROM channel_join_requests WHERE id = $1",
    [requestId]
  );
  return result.rows[0];
};

/**
 * Memperbarui status sebuah permintaan join.
 * @param {string} requestId
 * @param {string} status - 'ACCEPTED' atau 'DECLINED'
 * @param {object} client - opsional, bisa pakai transaksi
 */
export const updateJoinRequestStatus = async (
  requestId,
  status,
  client = pool
) => {
  await client.query(
    `UPDATE channel_join_requests SET status = $1 WHERE id = $2`,
    [status, requestId]
  );
};

export const findMembersByChannelId = async (channelId) => {
  const query = {
    text: `
        SELECT
          u.id,
          u.username,
          u.email,
          cm.role,
          cm.joined_at
        FROM
          users AS u
        JOIN
          channel_members AS cm ON u.id = cm.user_id
        WHERE
          cm.channel_id = $1
        ORDER BY
          cm.role, u.username;
      `,
    values: [channelId],
  };
  const result = await pool.query(query);
  return result.rows;
};
