import { Router } from 'express';
import { getAllTeams, createTeam, getMyTeam, updateMyTeam, deleteMyTeam } from './teams.controller.js';
import isAuthenticated from '../../middlewares/isAuthenticated.js'; // Asumsi middleware sudah ada

const teamRouter = Router();

// Semua rute di bawah ini akan dilindungi dan memerlukan user untuk login
teamRouter.use(isAuthenticated);

teamRouter.get("/", getAllTeams);
teamRouter.post("/", createTeam);
teamRouter.get("/:id", getMyTeam);
teamRouter.put("/:id", updateMyTeam);
teamRouter.delete("/:id", deleteMyTeam);

export default teamRouter;