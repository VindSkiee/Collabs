import AppError from "../utils/appError.js";
import { pool } from "../../config/db.js";

/**
 * Middleware untuk memverifikasi apakah pengguna yang login adalah ANGGOTA dari tim tertentu.
 * Ini lebih longgar daripada isTeamLeader atau isTeamOwner.
 */
export const isTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id; // Diambil dari isAuthenticated

    const query = {
      text: `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
      values: [teamId, userId],
    };
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      // Jika tidak ditemukan, berarti user bukan anggota tim ini
      return next(new AppError('Anda bukan anggota tim ini.', 403)); // 403 Forbidden
    }

    next();
  } catch (error) {
    next(error);
  }
};