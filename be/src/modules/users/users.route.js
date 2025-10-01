// src/modules/users/users.route.js
import express from "express";
import { getMyProfile } from "./users.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";

const userRouter = express.Router();

// Semua rute user memerlukan login
userRouter.use(isAuthenticated);

// Endpoint untuk mendapatkan profil diri sendiri
userRouter.get("/me", getMyProfile);

export default userRouter;
