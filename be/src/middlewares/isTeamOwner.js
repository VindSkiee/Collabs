import AppError from "../utils/appError.js";
import { pool } from "../../config/db.js";

/**
 * Middleware untuk memverifikasi apakah pengguna yang login adalah PEMILIK ASLI (owner) dari tim.
 */
export const isTeamOwner = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id; // Diambil dari isAuthenticated

    const query = {
      text: `SELECT owner_id FROM teams WHERE id = $1`,
      values: [teamId],
    };
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return next(new AppError('Tim tidak ditemukan.', 404));
    }

    if (result.rows[0].owner_id !== userId) {
      return next(new AppError('Hanya pemilik asli tim yang dapat melakukan aksi ini.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};