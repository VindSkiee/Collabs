import { getAllTeamsForUser, createNewTeam, getTeamById, updateTeam, deleteTeam } from './teams.service.js';

// GET /api/v1/teams - Mendapatkan semua tim yang diikuti user
export const getAllTeams = async (req, res, next) => {
  try {
    const userId = req.user.id; // req.user.id didapat dari middleware autentikasi setelah user login
    const teams = await getAllTeamsForUser(userId);
    res.status(200).json({
      status: 'success',
      data: { teams },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/teams - Membuat tim baru
export const createTeam = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const teamData = req.body;
    const newTeam = await createNewTeam(teamData, ownerId);
    res.status(201).json({
      status: 'success',
      data: { team: newTeam },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/teams/:id - Mendapatkan detail satu tim
export const getMyTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await getTeamById(id);
    res.status(200).json({
      status: 'success',
      data: { team },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/teams/:id - Memperbarui tim
export const updateMyTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const teamData = req.body;
    const updatedTeam = await updateTeam(id, teamData, userId);
    res.status(200).json({
      status: 'success',
      data: { team: updatedTeam },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/teams/:id - Menghapus tim
export const deleteMyTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await deleteTeam(id, userId);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
