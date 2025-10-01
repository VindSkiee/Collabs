import { logger } from "../utils/logger.js";

/**
 * Error handling middleware
 */
export function errorMiddleware(err, req, res, next) {
  // Log detail error (stack hanya kalau bukan AppError)
  if (err.isOperational) {
    logger.warn(`${err.statusCode} - ${err.message}`);
  } else {
    logger.error(err.stack || err.message || err);
  }

  // Ambil statusCode dari AppError, fallback 500
  const statusCode = err.statusCode || 500;
  const status = err.status || (statusCode.toString().startsWith("4") ? "fail" : "error");

  // Buat response
  const response = {
    success: false,
    status,
    message: err.isOperational
      ? err.message
      : "Internal Server Error", // jangan bocorin bug
  };

  // Tambahin detail hanya di dev (buat debugging)
  if (process.env.NODE_ENV === "development" && !err.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
