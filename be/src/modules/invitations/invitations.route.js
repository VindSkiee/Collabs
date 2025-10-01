import express from 'express';
import { sendInvitation, getMyPendingInvitations, handleInvitationResponse } from './invitations.controller.js';
import isAuthenticated from '../../middlewares/isAuthenticated.js'; 
import { isTeamLeader } from '../../middlewares/isTeamLeader.js';

const inviteRouter = express.Router();

// Semua rute undangan memerlukan login
inviteRouter.use(isAuthenticated);

// Rute khusus untuk mengirim undangan dari sebuah tim
// Memerlukan user untuk menjadi LEADER dari tim tersebut
inviteRouter.post('/:teamId/invitations', isTeamLeader, sendInvitation);

// Rute untuk mengelola undangan pribadi
inviteRouter.get('/pending', getMyPendingInvitations);
inviteRouter.post('/:invitationId/respond', handleInvitationResponse);

export default inviteRouter;