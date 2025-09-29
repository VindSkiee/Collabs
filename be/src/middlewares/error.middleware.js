import { logger } from "../utils/logger.js";

/**
 * Error handling middleware
 * Menangani error dari seluruh aplikasi Express
 */
export function errorMiddleware(err, req, res, next) {
  // Log error detail
  logger.error(err.stack || err.message || err);

  // Tentukan status code (default: 500)
  const status = err.status || err.statusCode || 500;

  // Pesan error yang aman untuk dikirim ke client
  const message =
    err.message ||
    (status === 500
      ? "Internal Server Error"
      : "An error occurred");

  res.status(status).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
}