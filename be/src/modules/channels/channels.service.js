import {
  createChannel as repoCreateChannel,
  findAllChannelsByTeamId as findAllByTeamId,
  addChannelMember,
  removeChannelMember,
  updateChannelMemberRole,
  updateChannelDetails,
  updateChannelSettings,
  removeChannel,
  createChannelMessage,
  findChannelMember, // Pastikan ada di repository
} from "./channels.repository.js";

import * as teamsRepository from "../teams/teams.repository.js";
import AppError from "../../utils/appError.js";
import { pool } from "../../../config/db.js";
import * as usersRepository from '../users/users.repository.js';
import { getIO } from "../../socket.js";

// Membuat channel baru (dengan transaksi)
export const createChannel = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const newChannel = await repoCreateChannel(data, client);
    await client.query("COMMIT");
    return newChannel;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getMembersOfChannel = async (channelId) => {
  return await channelsRepository.findMembersByChannelId(channelId);
};

// List channels di tim, dengan cek owner
export const listChannels = async (teamId, userId) => {
  // Langkah 1: Dapatkan data tim untuk mengetahui siapa pemiliknya
  const team = await teamsRepository.findById(teamId);
  if (!team) {
    throw new AppError("Tim tidak ditemukan", 404);
  }

  // Langkah 2: Dapatkan peran pengguna di dalam tim ini
  const membership = await teamsRepository.findMembersByTeamId(userId, teamId);
  if (!membership) {
    // Pastikan pengguna adalah anggota tim sebelum bisa melihat channel apa pun
    throw new AppError("Anda bukan anggota dari tim ini.", 403);
  }

  // Langkah 3: Tentukan hak akses pengguna
  const isOwner = team.owner_id === userId;
  const userTeamRole = membership.role; // 'LEADER' atau 'MEMBER'

  // Langkah 4: Panggil repository dengan membawa informasi hak akses
  const channels = await findAllByTeamId(teamId, userTeamRole, isOwner);

  return channels;
};

// Kick member dari channel
export const kickMember = async (channelId, memberIdToKick, actorId) => {
  const channel = await findChannelById(channelId);
  if (memberIdToKick === actorId)
    throw new AppError("Anda tidak bisa mengeluarkan diri sendiri.", 400);
  if (memberIdToKick === channel.creator_id)
    throw new AppError("Anda tidak bisa mengeluarkan pembuat channel.", 403);

  return await removeChannelMember(channelId, memberIdToKick);
};

// Promote member
export const promoteMember = async (channelId, memberIdToPromote) => {
  return await updateChannelMemberRole(channelId, memberIdToPromote, "LEADER");
};

// Demote leader
export const demoteLeader = async (channelId, leaderIdToDemote, actorId) => {
  const channel = await findChannelById(channelId);
  if (leaderIdToDemote === actorId)
    throw new AppError("Anda tidak bisa menurunkan peran diri sendiri.", 400);
  if (leaderIdToDemote === channel.creator_id)
    throw new AppError(
      "Anda tidak bisa menurunkan peran pembuat channel.",
      403
    );

  return await updateChannelMemberRole(channelId, leaderIdToDemote, "MEMBER");
};

// Update channel details
export const updateDetails = async (channelId, data) => {
  return await updateChannelDetails(channelId, data);
};

// Update channel settings
export const updateSettings = async (channelId, settings) => {
  return await updateChannelSettings(channelId, settings);
};

// Delete channel
export const deleteChannel = async (channelId) => {
  return await removeChannel(channelId);
};

// Post message
export const postMessage = async (channelId, userId, content) => {
  const channel = await channelsRepository.findById(channelId);
  if (!channel) throw new AppError('Channel tidak ditemukan.', 404);

  const membership = await findChannelMember(channelId, userId);
  if (!membership) throw new AppError('Anda bukan anggota channel ini.', 403);

  if (channel.chat_mode === 'LEADERS_ONLY' && membership.role !== 'LEADER') {
    throw new AppError('Hanya Leader yang bisa mengirim pesan di channel ini.', 403);
  }

  // Simpan pesan
  const user = await usersRepository.findById(userId);
  const newMessage = await createChannelMessage({
    channelId,
    userId,
    content,
  });

  // Broadcast ke room channel
  const io = getIO();
  const payload = {
    ...newMessage,
    user: {
      id: user.id,
      username: user.username,
    },
  };
  io.to(`channel-${channel.id}`).emit('newMessage', payload);

  return newMessage;
};

export const joinOrRequestToJoinChannel = async (channelId, userId) => {
  const channel = await findById(channelId);
  if (!channel) throw new AppError("Channel tidak ditemukan.", 404);

  const team = await teamsRepository.findById(channel.team_id);
  const isOwner = team.owner_id === userId;

  // Hak istimewa untuk Owner Team
  if (isOwner) {
    return {
      action: "JOINED",
      data: await addChannelMember(channelId, userId, "LEADER"),
    };
  }

  // User biasa
  if (channel.type === "PUBLIC" && channel.status === "OPEN") {
    return {
      action: "JOINED",
      data: await addChannelMember(channelId, userId, "MEMBER"),
    };
  } else {
    // PRIVATE atau LOCKED → buat permintaan
    const request = await createJoinRequest(channelId, userId);
    if (!request) {
      return {
        action: "REQUEST_ALREADY_PENDING",
        message: "Anda sudah mengirim permintaan untuk bergabung.",
      };
    }
    return { action: "REQUEST_CREATED", data: request };
  }
};

/**
 * Menampilkan daftar permintaan yang PENDING untuk channel (hanya untuk Leader Channel)
 */
export const getPendingJoinRequests = async (channelId) => {
  return await findPendingRequestsByChannel(channelId);
};

/**
 * Merespon permintaan join (hanya untuk Leader Channel)
 */
export const respondToJoinRequest = async (requestId, response) => {
  const request = await findJoinRequestById(requestId);
  if (!request || request.status !== "PENDING") {
    throw new AppError("Permintaan tidak ditemukan atau sudah direspon.", 404);
  }

  if (response === "ACCEPTED") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await updateJoinRequestStatus(requestId, "ACCEPTED", client);
      await addChannelMember(
        request.channel_id,
        request.user_id,
        "MEMBER",
        client
      );
      await client.query("COMMIT");
      return {
        message: `Permintaan diterima. Pengguna telah ditambahkan ke channel.`,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } else if (response === "DECLINED") {
    await updateJoinRequestStatus(requestId, "DECLINED");
    return { message: "Permintaan ditolak." };
  } else {
    throw new AppError("Respon tidak valid.", 400);
  }
};
