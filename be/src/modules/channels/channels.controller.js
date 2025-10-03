import {
  createChannel,
  listChannels,
  joinOrRequestToJoinChannel,
  kickMember,
  promoteMember,
  demoteLeader,
  updateDetails,
  updateSettings,
  deleteChannel,
  postMessage,
} from "./channels.service.js";

// Create channel
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      teamId: req.params.teamId,
      creatorId: req.user.id,
    };
    const channel = await createChannel(data);
    res.status(201).json({ status: "success", data: { channel } });
  } catch (error) {
    next(error);
  }
};

// List all channels
export const list = async (req, res, next) => {
  try {
    const channels = await listChannels(req.params.teamId, req.user.id);
    res.status(200).json({ status: "success", data: { channels } });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const members = await channelsService.getMembersOfChannel(channelId);
    res.status(200).json({
      status: "success",
      count: members.length,
      data: { members },
    });
  } catch (error) {
    next(error);
  }
};

// Join channel
export const joinChannel = async (req, res, next) => {
  try {
    const result = await joinOrRequestToJoinChannel(
      req.params.channelId,
      req.user.id
    );
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

// Kick member
export const kick = async (req, res, next) => {
  try {
    await kickMember(req.params.channelId, req.params.memberId, req.user.id);
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

// Promote member
export const promote = async (req, res, next) => {
  try {
    const updated = await promoteMember(
      req.params.channelId,
      req.params.memberId
    );
    res.status(200).json({ status: "success", data: { updated } });
  } catch (error) {
    next(error);
  }
};

// Demote leader
export const demote = async (req, res, next) => {
  try {
    const updated = await demoteLeader(
      req.params.channelId,
      req.params.leaderId,
      req.user.id
    );
    res.status(200).json({ status: "success", data: { updated } });
  } catch (error) {
    next(error);
  }
};

// Update channel details
export const update = async (req, res, next) => {
  try {
    const channel = await updateDetails(req.params.channelId, req.body);
    res.status(200).json({ status: "success", data: { channel } });
  } catch (error) {
    next(error);
  }
};

// Update channel settings
export const settings = async (req, res, next) => {
  try {
    const channel = await updateSettings(req.params.channelId, req.body);
    res.status(200).json({ status: "success", data: { channel } });
  } catch (error) {
    next(error);
  }
};

// Delete channel
export const remove = async (req, res, next) => {
  try {
    await deleteChannel(req.params.channelId);
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

// Post message
export const message = async (req, res, next) => {
  try {
    const msg = await postMessage(
      req.params.channelId,
      req.user.id,
      req.body.content
    );
    res.status(201).json({ status: "success", data: { message: msg } });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk mengambil daftar permintaan join yang PENDING
 */
export const listJoinRequests = async (req, res, next) => {
  try {
    const requests = await getPendingJoinRequests(req.params.channelId);
    res.status(200).json({ status: "success", data: { requests } });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk merespon join request (ACCEPTED / DECLINED)
 */
export const handleJoinResponse = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body; // 'ACCEPTED' atau 'DECLINED'
    const result = await respondToJoinRequest(requestId, response);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};
