import { Router } from "express";
import {
  getAllTeams,
  createTeam,
  getMyTeam,
  updateMyTeam,
  deleteMyTeam,
  memberToLeader,
  leaderToMember,
  getTeamMembers,
} from "./teams.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js"; // Asumsi middleware sudah ada
import { isTeamOwner } from "../../middlewares/isTeamOwner.js";
import { isTeamMember } from "../../middlewares/isTeamMember.js";

const teamRouter = Router();

// Semua rute di bawah ini akan dilindungi dan memerlukan user untuk login
teamRouter.use(isAuthenticated);

teamRouter.get("/", getAllTeams);
teamRouter.post("/", createTeam);

// Rute untuk mengelola anggota tim
teamRouter.get("/:teamId/members", isTeamMember, getTeamMembers);
teamRouter.put(
  "/:teamId/members/:memberId/promote",
  isTeamOwner,
  memberToLeader
);
teamRouter.put(
  "/:teamId/members/:memberId/demote",
  isTeamOwner,
  leaderToMember
);

//  Rute untuk operasi pada tim tertentu
teamRouter.get("/:id", getMyTeam);
teamRouter.put("/:id", isTeamOwner, updateMyTeam);
teamRouter.delete("/:id", isTeamOwner, deleteMyTeam);

export default teamRouter;
