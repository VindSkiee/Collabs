import AppError from "../../utils/appError.js";
import { pool } from "../../../config/db.js";

export const isChannelCreator = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `SELECT creator_id FROM channels WHERE id = $1`,
      values: [channelId],
    };
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return next(new AppError("Channel tidak ditemukan.", 404));
    }

    if (result.rows[0].creator_id !== userId) {
      return next(
        new AppError(
          "Hanya pembuat channel yang dapat melakukan aksi ini.",
          403
        )
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
