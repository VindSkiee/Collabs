import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js'; // Menggunakan AppError
import { logger } from '../utils/logger.js';

/**
 * Middleware untuk memverifikasi JWT.
 * Jika token valid, data user (payload) akan ditambahkan ke `req.user`.
 */
function isAuthenticated(req, res, next) {
  try {
    let token;
    // 1. Cek apakah header Authorization ada dan berformat "Bearer <token>"
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Jika tidak ada token, kirim error 401 Unauthorized
      return next(new AppError('Anda belum login. Silakan login untuk mendapatkan akses.', 401));
    }

    // 2. Verifikasi token menggunakan secret key
    // Pastikan Anda sudah mengatur JWT_SECRET di file .env Anda
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Jika verifikasi berhasil, tambahkan payload ke request
    // Payload ini berisi data user yang Anda masukkan saat membuat token (misal: id, email, role)
    req.user = decoded;
    
    logger.info(`User authenticated: ${req.user.email}`);

    // Lanjutkan ke controller/middleware selanjutnya
    next();
  } catch (error) {
    // Tangani error jika token tidak valid atau kedaluwarsa
    logger.error('Authentication failed:', error.message);
    return next(new AppError('Token tidak valid atau kedaluwarsa.', 401));
  }
}

export default isAuthenticated;