import * as teamsRepository from './teams.repository.js';
import AppError from '../../utils/appError.js';

/**
 * Mendapatkan semua tim yang diikuti user
 */
export const getAllTeamsForUser = async (userId) => {
  return await teamsRepository.findAllByUserId(userId);
};

/**
 * Membuat tim baru
 */
export const createNewTeam = async (teamData, ownerId) => {
  if (!teamData.name) {
    throw new AppError('Nama tim tidak boleh kosong.', 400);
  }
  return await teamsRepository.create(teamData, ownerId);
};

/**
 * Mendapatkan detail satu tim
 */
export const getTeamById = async (teamId) => {
  const team = await teamsRepository.findById(teamId);
  if (!team) {
    throw new AppError('Tim tidak ditemukan.', 404);
  }
  return team;
};

/**
 * Memperbarui tim
 */
export const updateTeam = async (teamId, teamData, userId) => {
  const team = await teamsRepository.findById(teamId);
  if (!team) {
    throw new AppError('Tim tidak ditemukan.', 404);
  }
  // Hanya owner/leader utama yang bisa mengubah nama tim
  if (team.owner_id !== userId) {
    throw new AppError('Anda tidak memiliki izin untuk mengubah tim ini.', 403);
  }
  return await teamsRepository.update(teamId, teamData);
};

/**
 * Menghapus tim
 */
export const deleteTeam = async (teamId, userId) => {
  const team = await teamsRepository.findById(teamId);
  if (!team) {
    throw new AppError('Tim tidak ditemukan.', 404);
  }
  // Hanya owner/leader utama yang bisa menghapus tim
  if (team.owner_id !== userId) {
    throw new AppError('Anda tidak memiliki izin untuk menghapus tim ini.', 403);
  }
  await teamsRepository.remove(teamId);
};
