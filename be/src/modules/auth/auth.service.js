import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { ENV } from "../../../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../../utils/appError.js";
import { findUserByEmail, insertUserWithPassword, updateUserPassword } from "../users/users.repository.js";

function generateJWT(user) {
  return jwt.sign(
    { id: user.id, email: user.email, provider: user.provider },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES }
  );
}

// Google OAuth2
const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

/**
 * Verifikasi token Google OAuth2 dan ambil data user
 * @param {string} token - ID token dari frontend
 * @returns {Promise<object>} - Data user Google
 */
export async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      provider: "google",
      email: payload.email,
      username: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
      sub: payload.sub,
    };
  } catch (error) {
    console.error("Google token verification error:", error.message);
    throw new AppError("Google token tidak valid", 401);
  }
}

/**
 * Verifikasi kode OAuth2 Github dan ambil data user
 * @param {string} code - Kode OAuth2 dari frontend
 * @returns {Promise<object>} - Data user Github
 */
export async function verifyGithubCode(code) {
  try {
    // 1. Tukar code dengan access_token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: ENV.GITHUB_CLIENT_ID,
        client_secret: ENV.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      throw new AppError("GitHub OAuth code tidak valid", 401);
    }

    // 2. Ambil data user dari Github API
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const primaryEmail = emailRes.data.find((e) => e.primary && e.verified);

    return {
      provider: "github",
      email: primaryEmail ? primaryEmail.email : null,
      username: userRes.data.name || userRes.data.login,
      picture: userRes.data.avatar_url,
      github_id: userRes.data.id,
    };
  } catch (error) {
    console.error("GitHub verification error:", error.message);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Gagal memverifikasi GitHub code", 500);
  }
}

/**
 * Register user dengan email & password
 */
export async function registerWithPassword({ email, username, password }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError("User sudah terdaftar dengan email ini", 409);
  }

  const hashedPassword = await bcrypt.hash(password, ENV.SALT_ROUNDS);

  const user = await insertUserWithPassword({
    email,
    username,
    hashedPassword,
  });

  return user;
}

/**
 * Login user dengan email & password
 */
export async function loginWithPassword({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Email atau password salah", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError("Email atau password salah", 401);
  }

  const token = generateJWT(user);
  return { user, token };
}

/**
 * Ubah password user
 */
export async function changePassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, ENV.SALT_ROUNDS);
  const updatedUser = await updateUserPassword(userId, hashedPassword);
  if (!updatedUser) {
    throw new AppError("Gagal mengubah password", 500);
  }
  return updatedUser;
}
