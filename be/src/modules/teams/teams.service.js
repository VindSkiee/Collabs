import * as teamsRepository from "./teams.repository.js";
import AppError from "../../utils/appError.js";

/**
 * Mendapatkan semua tim yang diikuti user
 */
export const getAllTeamsForUser = (userId) => {
  return teamsRepository.findAllByUserId(userId);
};

/**
 * Membuat tim baru
 */
export const createNewTeam = (teamData, ownerId) => {
  if (!teamData.name) {
    throw new AppError("Nama tim tidak boleh kosong.", 400);
  }
  return teamsRepository.create(teamData, ownerId);
};

/**
 * Mendapatkan detail satu tim
 */
export const getTeamById = async (teamId) => {
  const team = await teamsRepository.findById(teamId);
  if (!team) throw new AppError("Tim tidak ditemukan.", 404);
  return team;
};

/**
 * Memperbarui tim (akses sudah dicek di middleware)
 */
export const updateTeam = (teamId, teamData) => {
  return teamsRepository.update(teamId, teamData);
};

/**
 * Menghapus tim (akses sudah dicek di middleware)
 */
export const deleteTeam = (teamId) => {
  return teamsRepository.remove(teamId);
};

/**
 * Mempromosikan anggota menjadi leader
 */
export const promoteMemberToLeader = async (teamId, memberIdToPromote) => {
  const updatedMembership = await teamsRepository.updateMemberRole(
    teamId,
    memberIdToPromote,
    "LEADER"
  );
  if (!updatedMembership) throw new AppError("Anggota tim tidak ditemukan.", 404);
  return updatedMembership;
};

/**
 * Menurunkan leader menjadi member
 */
export const demoteLeaderToMember = async (teamId, memberIdToDemote) => {
  const updatedMembership = await teamsRepository.updateMemberRole(
    teamId,
    memberIdToDemote,
    "MEMBER"
  );
  if (!updatedMembership) throw new AppError("Anggota tim tidak ditemukan.", 404);
  return updatedMembership;
};

/**
 * Melihat seluruh anggota dari sebuah tim
 */
export const getMembersOfTeam = (teamId) => {
  return teamsRepository.findMembersByTeamId(teamId);
};
