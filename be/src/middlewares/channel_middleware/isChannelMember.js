import AppError from "../../utils/appError.js";
import { pool } from "../../../config/db.js";

export const isChannelMember = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2`,
      values: [channelId, userId],
    };
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return next(new AppError('Anda bukan anggota dari channel ini.', 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};