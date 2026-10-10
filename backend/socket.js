import jwt from 'jsonwebtoken';
import User from './models/User.js';
import { sendMessage, markRead } from './controllers/messageController.js';

// Each user joins a private room `user:<id>`, so every open tab/device receives their events.
export function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const { id } = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(id).select('_id name');
      if (!user) throw new Error('no user');
      socket.userId = String(user._id);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const me = socket.userId;
    socket.join(`user:${me}`);

    socket.on('message:send', async ({ to, text } = {}, ack) => {
      try {
        const msg = await sendMessage(me, to, text);
        io.to(`user:${to}`).to(`user:${me}`).emit('message:new', msg);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('typing', ({ to, isTyping } = {}) => {
      if (to) io.to(`user:${to}`).emit('typing', { from: me, isTyping: !!isTyping });
    });

    socket.on('message:read', async ({ from } = {}) => {
      try {
        if (from && (await markRead(me, from))) io.to(`user:${from}`).emit('message:read', { by: me });
      } catch (err) {
        console.error('message:read failed', err.message);
      }
    });
  });
}
