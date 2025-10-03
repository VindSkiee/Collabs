// src/modules/channels/channels.route.js
import express from 'express';
import {
  create,
  list,
  joinChannel as join,
  kick,
  promote,
  demote,
  update,
  settings,
  remove,
  message,
  listJoinRequests,
  handleJoinResponse,
  getMembers,
} from './channels.controller.js';

import isAuthenticated from '../../middlewares/isAuthenticated.js';

// Middleware level Team
import { isTeamMember } from '../../middlewares/isTeamMember.js';
import { isTeamLeader } from '../../middlewares/isTeamLeader.js';
import { isTeamOwner } from '../../middlewares/isTeamOwner.js';

// Middleware level Channel
import { isChannelMember } from '../../middlewares/channel_middleware/isChannelMember.js';
import { isChannelLeader } from '../../middlewares/channel_middleware/isChannelLeader.js';
import { isChannelCreator } from '../../middlewares/channel_middleware/isChannelCreator.js';

const channelRouter = express.Router();
channelRouter.use(isAuthenticated);

// ==== Rute di level Team ====
// Membuat channel (hanya team leader) & Melihat list channel (semua team member)
channelRouter
  .route('/teams/:teamId/channels')
  .post(isTeamLeader, create)
  .get(isTeamMember, list);

// ==== Rute di level Channel ====

// Join channel (harus anggota tim dulu)
channelRouter.post('/channels/:channelId/join', isTeamMember, join);

// Hapus channel (hanya team owner atau channel creator)
channelRouter.delete('/channels/:channelId', isTeamOwner, remove);

// Mendapatkan semua anggota dari sebuah channel (harus anggota tim & anggota channel)
channelRouter.get('/channels/:channelId/members', isTeamMember, isChannelMember, getMembers);

// Kirim pesan (harus anggota tim & anggota channel)
channelRouter.post(
  '/channels/:channelId/messages',
  isTeamMember,
  isChannelMember,
  message
);

// Kick member (harus anggota tim & channel leader)
channelRouter.delete(
  '/channels/:channelId/members/:memberId',
  isTeamMember,
  isChannelLeader,
  kick
);

// Promote member (harus anggota tim & channel leader)
channelRouter.post(
  '/channels/:channelId/members/:memberId/promote',
  isTeamMember,
  isChannelLeader,
  promote
);

// Demote leader (harus anggota tim & channel leader)
channelRouter.post(
  '/channels/:channelId/leaders/:leaderId/demote',
  isTeamMember,
  isChannelLeader,
  demote
);

// Update detail channel (harus anggota tim & channel creator)
channelRouter.patch(
  '/channels/:channelId',
  isTeamMember,
  isChannelCreator,
  update
);

// Update settings channel (harus anggota tim & channel creator)
channelRouter.patch(
  '/channels/:channelId/settings',
  isTeamMember,
  isChannelCreator,
  settings
);

// ==== Rute untuk join request ====

// Melihat daftar permintaan join (hanya leader channel)
channelRouter.get(
  '/channels/:channelId/join-requests',
  isChannelLeader,
  listJoinRequests
);

// Menanggapi permintaan join (hanya leader channel)
channelRouter.put(
  '/join-requests/:requestId/respond',
  isChannelLeader, // pastikan hanya leader channel yang bisa akses
  handleJoinResponse
);

export default channelRouter;
