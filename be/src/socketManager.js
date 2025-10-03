import jwt from 'jsonwebtoken';
import { logger } from './utils/logger.js';
import * as usersRepository from './modules/users/users.repository.js';
import * as channelsRepository from './modules/channels/channels.repository.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

let io;

export const initializeSocketIO = async (socketIO) => {
  io = socketIO;

  // Redis adapter opsional
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await pubClient.connect();
      await subClient.connect();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("Redis adapter connected for Socket.IO");
    } catch (err) {
      logger.error("Redis connection failed:", err);
    }
  }

  // Middleware autentikasi socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', async (socket) => {
    logger.info(`User connected: ${socket.user.email} (Socket ID: ${socket.id})`);

    // Room pribadi untuk notifikasi
    socket.join(`user-${socket.user.id}`);

    // Join ke semua channel user
    try {
      const channels = await usersRepository.findUserChannels(socket.user.id);
      channels.forEach(channel => {
        const roomName = `channel-${channel.id}`;
        socket.join(roomName);
      });
    } catch (err) {
      logger.error('Failed fetching user channels:', err);
    }

    // Event kirim pesan
    socket.on('sendMessage', async ({ channelId, content }) => {
      try {
        content = content?.trim();
        if (!content) return;

        const channel = await channelsRepository.findById(channelId);
        const membership = await channelsRepository.findMember(channelId, socket.user.id);

        if (!membership) {
          return socket.emit('error', { message: 'Anda bukan anggota channel ini.' });
        }
        if (channel.chat_mode === 'LEADERS_ONLY' && membership.role !== 'LEADER') {
          return socket.emit('error', { message: 'Hanya Leader yang bisa mengirim pesan.' });
        }

        // Simpan pesan ke DB
        const message = await channelsRepository.createMessage({
          channelId,
          userId: socket.user.id,
          content,
        });

        // Broadcast pesan ke channel
        const payload = {
          ...message,
          user: {
            id: socket.user.id,
            username: socket.user.username,
          },
        };

        io.to(`channel-${channel.id}`).emit('newMessage', payload);
      } catch (err) {
        logger.error('Failed to send message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.email}`);
    });
  });
};

export const getIOInstance = () => {
  if (!io) throw new Error('Socket.IO not initialized!');
  return io;
};
