import { Router } from "express";
import {
  loginWithGoogle,
  loginWithGithub,
  loginRegular,
  registerRegular,
  updatePassword,
} from "./auth.controller.js";

const authRouter = Router();

// POST /api/v1/auth/google
authRouter.post("/google", loginWithGoogle);

// POST /api/v1/auth/github
authRouter.post("/github", loginWithGithub);
authRouter.post("/login", loginRegular);
authRouter.post("/register", registerRegular);
authRouter.post("/update-password", updatePassword);

export default authRouter;
