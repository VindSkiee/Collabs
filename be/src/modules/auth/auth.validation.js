// src/validations/auth.validation.js
import { z } from "zod";
import xss from "xss";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username minimal 3 karakter").transform((val) => xss(val)),
    email: z.string().email("Email tidak valid").transform((val) => xss(val)),
    password: z.string().min(6, "Password minimal 6 karakter").transform((val) => xss(val)),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter")
      .transform((val) => xss(val)),

    email: z
      .string()
      .email("Email tidak valid")
      .transform((val) => xss(val)),

    password: z
      .string()
      .min(6, "Password minimal 6 karakter")
      .max(100, "Password maksimal 100 karakter"),

    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter")
      .max(100, "Konfirmasi password maksimal 100 karakter"),
  }),
}).refine((data) => data.body.password === data.body.confirmPassword, {
  path: ["body.confirmPassword"],
  message: "Password tidak sama",
});
