import {
  createInvitation as createInvitationRepo,
  findPendingInvitationsByEmail,
  findInvitationById,
  updateInvitationStatus,
  addTeamMember,
} from "./invitations.repository.js";
import * as usersRepository from "../users/users.repository.js";
import * as teamsRepository from "../teams/teams.repository.js"; // kita asumsikan ada repo ini
import AppError from "../../utils/appError.js";
import { pool } from "../../../config/db.js";

export const createInvitation = async (teamId, inviterId, inviteeEmail) => {
  // 1. Cek apakah email terdaftar sebagai user
  const user = await usersRepository.findUserByEmail(inviteeEmail);

  if (user) {
    // 2. Jika user sudah ada, cek apakah sudah menjadi member tim
    const isMember = await teamsRepository.isMemberOfTeam(
      user.id,
      teamId
    );
    if (isMember) {
      throw new AppError(`${inviteeEmail} sudah menjadi anggota tim ini.`, 400);
    }
  }

  // 3. Opsional: cek apakah sudah ada undangan pending sebelumnya
  const pendingInvitations = await findPendingInvitationsByEmail(inviteeEmail);
  const alreadyInvited = pendingInvitations.some(
    (inv) => inv.team_id === teamId
  );
  if (alreadyInvited) {
    throw new AppError(
      `${inviteeEmail} sudah menerima undangan untuk tim ini.`,
      400
    );
  }

  // 4. Buat undangan
  return await createInvitationRepo(teamId, inviterId, inviteeEmail);
};

export const getPendingInvitationsForUser = async (userEmail) => {
  return await findPendingInvitationsByEmail(userEmail);
};

export const INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
};

export const respondToInvitation = async (invitationId, user, response) => {
  if (!response) throw new AppError("Property 'response' wajib diisi", 400);

  const invitation = await findInvitationById(invitationId);

  if (!invitation) throw new AppError("Undangan tidak ditemukan.", 404);
  if (invitation.status !== INVITATION_STATUS.PENDING)
    throw new AppError("Undangan ini sudah tidak aktif.", 400);
  if (invitation.invitee_email !== user.email)
    throw new AppError("Anda tidak diizinkan merespon undangan ini.", 403);

  if (![INVITATION_STATUS.ACCEPTED, INVITATION_STATUS.DECLINED].includes(response)) {
    throw new AppError(
      `Respon tidak valid. Gunakan '${INVITATION_STATUS.ACCEPTED}' atau '${INVITATION_STATUS.DECLINED}'.`,
      400
    );
  }

  if (response === INVITATION_STATUS.ACCEPTED) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updatedInvitation = await updateInvitationStatus(invitationId, INVITATION_STATUS.ACCEPTED, client);
      await addTeamMember(user.id, invitation.team_id, client);
      await client.query('COMMIT');
      return updatedInvitation;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else if (response === INVITATION_STATUS.DECLINED) {
    return await updateInvitationStatus(invitationId, INVITATION_STATUS.DECLINED);
  }
};
