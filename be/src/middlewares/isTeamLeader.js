import AppError from "../utils/appError.js";
import { pool } from "../../config/db.js";

/**
 * Middleware untuk memverifikasi apakah pengguna yang login adalah LEADER dari tim tertentu.
 */
export const isTeamLeader = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id; // Diambil dari isAuthenticated

    const query = {
      text: `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2`,
      values: [teamId, userId],
    };
    const result = await pool.query(query);

    if (result.rows.length === 0 || result.rows[0].role !== "LEADER") {
      return next(
        new AppError("Hanya leader tim yang dapat melakukan aksi ini.", 403)
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
