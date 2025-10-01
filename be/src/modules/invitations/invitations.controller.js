// src/modules/invitations/invitations.controller.js
import { createInvitation, getPendingInvitationsForUser, respondToInvitation } from './invitations.service.js';
import AppError from '../../utils/appError.js';

export const sendInvitation = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const inviterId = req.user.id;
    const { inviteeEmail } = req.body;

    const invitation = await createInvitation(teamId, inviterId, inviteeEmail);
    res.status(201).json({
      status: 'success',
      message: `Undangan berhasil dikirim ke ${inviteeEmail}`,
      data: { invitation },
    });
  } catch (error) {
    // Tangani AppError agar pesan lebih jelas
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    }
    // Tangani error lain
    next(error);
  }
};

export const getMyPendingInvitations = async (req, res, next) => {
  try {
    const invitations = await getPendingInvitationsForUser(req.user.email);
    res.status(200).json({
      status: 'success',
      data: { invitations },
    });
  } catch (error) {
    next(error);
  }
};

export const handleInvitationResponse = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { response } = req.body || {}; // Validasi supaya tidak undefined
    const user = req.user;

    if (!response) throw new AppError("Property 'response' wajib diisi", 400);

    const result = await respondToInvitation(invitationId, user, response);

    res.status(200).json({
      status: 'success',
      message: `Undangan berhasil di-${response.toLowerCase()}`,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};
