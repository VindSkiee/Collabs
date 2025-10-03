import AppError from "../../utils/appError.js";
import { pool } from "../../../config/db.js";

export const isChannelLeader = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `SELECT role FROM channel_members WHERE channel_id = $1 AND user_id = $2`,
      values: [channelId, userId],
    };
    const result = await pool.query(query);

    if (result.rows.length === 0 || result.rows[0].role !== 'LEADER') {
      return next(new AppError('Hanya leader channel yang dapat melakukan aksi ini.', 403));
    }
    req.channelRole = result.rows[0].role; // Menyimpan peran untuk digunakan nanti jika perlu
    next();
  } catch (error) {
    next(error);
  }
};