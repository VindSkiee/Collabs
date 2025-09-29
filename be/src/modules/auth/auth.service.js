import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { ENV } from "../../../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
}

/**
 * Verifikasi kode OAuth2 Github dan ambil data user
 * @param {string} code - Kode OAuth2 dari frontend
 * @returns {Promise<object>} - Data user Github
 */
export async function verifyGithubCode(code) {
  // 1. Tukar code dengan access_token
  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: ENV.GITHUB_CLIENT_ID,
      client_secret: ENV.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: { Accept: "application/json" },
    }
  );
  const accessToken = tokenRes.data.access_token;

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
}

/**
 * Register user dengan email & password
 */
export async function registerWithPassword({ email, username, password }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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
    throw new Error("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  const token = generateJWT(user);
  return { user, token };
}

/**
 * Ubah password user
 */
export async function changePassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  return await updateUserPassword(userId, hashedPassword);
}
