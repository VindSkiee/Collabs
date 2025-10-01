/**
 * Class helper untuk membuat error yang terstruktur dan operasional.
 * Error yang dibuat dengan class ini adalah error yang "terduga" (misal: input salah,
 * data tidak ditemukan, tidak punya izin), bukan error sistem/bug.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Menentukan status 'fail' atau 'error' berdasarkan statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Menandai bahwa ini adalah error operasional, bukan bug
    this.isOperational = true;

    // Menyimpan stack trace error
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;