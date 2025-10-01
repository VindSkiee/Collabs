import { pool } from "../../../config/db.js";

export const createInvitation = async (teamId, inviterId, inviteeEmail) => {
  const query = {
    text: `INSERT INTO team_invitations(team_id, inviter_id, invitee_email)
           VALUES($1, $2, $3) RETURNING *`,
    values: [teamId, inviterId, inviteeEmail],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

export const findPendingInvitationsByEmail = async (email) => {
  const query = {
    text: `SELECT inv.*, t.name as team_name
           FROM team_invitations inv
           JOIN teams t ON inv.team_id = t.id
           WHERE inv.invitee_email = $1 AND inv.status = 'PENDING' AND inv.expires_at > NOW()`,
    values: [email],
  };
  const result = await pool.query(query);
  return result.rows;
};

export const findInvitationById = async (invitationId) => {
  const query = {
    text: "SELECT * FROM team_invitations WHERE id = $1",
    values: [invitationId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

export const updateInvitationStatus = async (invitationId, status) => {
  const query = {
    text: `UPDATE team_invitations SET status = $1 WHERE id = $2 RETURNING *`,
    values: [status, invitationId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

// Helper untuk menambahkan member baru ke tim, akan digunakan dalam transaksi
export const addTeamMember = async (userId, teamId, client = pool) => {
  const query = {
    text: `INSERT INTO team_members(user_id, team_id, role) VALUES($1, $2, 'MEMBER')`,
    values: [userId, teamId],
  };
  await client.query(query);
};
