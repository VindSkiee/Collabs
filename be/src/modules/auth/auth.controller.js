import jwt from "jsonwebtoken";
import {
  verifyGoogleToken,
  verifyGithubCode,
  changePassword,
  loginWithPassword,
  registerWithPassword,
} from "./auth.service.js";
import { ENV } from "../../../config/env.js";
import { oauthCallbackHandler } from "../users/users.controller.js";
import { success } from "zod";
import { sendLoginSuccessEmail } from "../email/email.service.js";

/**
 * Generate JWT
 */
function generateJWT(user) {
  return jwt.sign(
    { id: user.id, email: user.email, provider: user.provider },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES }
  );
}

/**
 * Login Google
 */
export async function loginWithGoogle(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const googleUser = await verifyGoogleToken(token);

    const user = await oauthCallbackHandler({
      provider: "google",
      provider_id: googleUser.sub,
      email: googleUser.email,
      username: googleUser.name,
      picture: googleUser.picture,
    });

    const jwtToken = generateJWT(user);

    await sendLoginSuccessEmail(user.email, user.username);

    res.status(200).json({ success: true, user, token: jwtToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Login GitHub
 */
export async function loginWithGithub(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const githubUser = await verifyGithubCode(code);

    const user = await oauthCallbackHandler({
      provider: "github",
      provider_id: githubUser.github_id,
      email: githubUser.email,
      name: githubUser.name,
      picture: githubUser.picture,
    });

    const jwtToken = generateJWT(user);
    res.status(200).json({ user, token: jwtToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Register user
 */
export async function registerRegular(req, res, next) {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, username and password are required" });
    }

    const user = await registerWithPassword({ email, username, password });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function loginRegular(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { user, token } = await loginWithPassword({ email, password });
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    next(error);
  }
}

/**
 * Ganti password
 */
export async function updatePassword(req, res, next) {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ message: "UserId and newPassword are required" });
    }

    const user = await changePassword(userId, newPassword);
    res.status(200).json({ message: "Password updated successfully", user });
  } catch (error) {
    next(error);
  }
}
