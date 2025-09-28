import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 5, // cuma 5 kali request login dalam 10 menit
  message: {
    success: false,
    message: "Terlalu banyak percobaan login, coba lagi nanti.",
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Terlalu banyak request, coba lagi nanti.",
  },
});
