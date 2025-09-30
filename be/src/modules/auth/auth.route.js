import { Router } from "express";
import {
  loginWithGoogle,
  loginRegular,
  registerRegular,
  updatePassword,
  githubOAuthCallback,
} from "./auth.controller.js";

const authRouter = Router();

// POST /api/v1/auth/google
authRouter.post("/google", loginWithGoogle);

// POST /api/v1/auth/github
authRouter.get("/github/callback", githubOAuthCallback);
authRouter.post("/login", loginRegular);
authRouter.post("/register", registerRegular);
authRouter.post("/update-password", updatePassword);


export default authRouter;
