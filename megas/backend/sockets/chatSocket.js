const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

function parseCookie(cookieString) {
  return cookieString?.split(';').reduce((acc, kv) => {
    const [key, value] = kv.trim().split('=');
    if (key && value) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function initChatSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  const activeUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || parseCookie(socket.handshake.headers.cookie || '').token;
    if (!token) {
      return next(new Error('Unauthorized'));
    }

    jwt.verify(token, process.env.JWT_SECRET || 'replace-with-secret', (err, user) => {
      if (err) {
        return next(new Error('Unauthorized'));
      }
      socket.user = user;
      next();
    });
  });

  io.on('connection', (socket) => {
    activeUsers.set(String(socket.user.id), socket.id);
    io.emit('presence:update', Array.from(activeUsers.keys()));

    socket.on('send_message', async ({ receiverId, message }) => {
      try {
        const result = await query(
          'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
          [socket.user.id, receiverId, message]
        );

        const payload = {
          id: result.lastInsertRowid,
          senderId: socket.user.id,
          receiverId,
          message,
          created_at: new Date(),
        };

        await query('INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, 0)', [
          receiverId,
          `${socket.user.username} sent a message.`,
        ]);

        const targetSocket = activeUsers.get(String(receiverId));
        if (targetSocket) {
          io.to(targetSocket).emit('receive_message', payload);
          io.to(targetSocket).emit('notification', {
            text: `${socket.user.username} sent you a new message.`,
          });
        }

        socket.emit('message_sent', payload);
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Unable to save message.' });
      }
    });

    socket.on('sendChefMessage', async ({ receiverId, message, isGroup }, callback) => {
      try {
        let result;
        let payload;

        if (isGroup) {
          // Send to chef group chat
          result = await query(
            'INSERT INTO messages (sender_id, receiver_id, message, chat_type) VALUES (?, ?, ?, ?)',
            [socket.user.id, null, message, 'chef_group']
          );
          
          payload = {
            id: result.lastInsertRowid,
            senderId: socket.user.id,
            receiverId: null,
            message,
            created_at: new Date(),
            isGroup,
            username: socket.user.username,
            chief_position: socket.user.chief_position
          };

          // Emit to all chef users
          const chefUsers = await query(
            'SELECT id FROM users WHERE role = ? AND (chief_position IS NOT NULL AND chief_position != "" OR username = "Admin User") AND id != ?',
            ['admin', socket.user.id]
          );
          
          for (const chef of chefUsers) {
            const chefSocket = activeUsers.get(String(chef.id));
            if (chefSocket) {
              io.to(chefSocket).emit('receiveChefMessage', payload);
            }
          }
        } else {
          // Send direct message
          if (!receiverId) {
            if (typeof callback === 'function') callback({ error: 'Receiver is required.' });
            return;
          }
          
          result = await query(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [socket.user.id, receiverId, message]
          );

          payload = {
            id: result.lastInsertRowid,
            senderId: socket.user.id,
            receiverId,
            message,
            created_at: new Date(),
            isGroup: false
          };

          const targetSocket = activeUsers.get(String(receiverId));
          if (targetSocket) {
            io.to(targetSocket).emit('receiveChefMessage', payload);
            io.to(targetSocket).emit('notification', {
              text: `${socket.user.username} (${socket.user.chief_position || 'Admin User'}) sent you a new message.`,
            });
          }
        }

        if (typeof callback === 'function') callback({ id: payload.id });
        socket.emit('chefMessageSent', payload);
      } catch (error) {
        console.error(error);
        if (typeof callback === 'function') callback({ error: 'Unable to save chef message.' });
        socket.emit('error', { message: 'Unable to save chef message.' });
      }
    });

    socket.on('typing', ({ receiverId }) => {
      const targetSocket = activeUsers.get(String(receiverId));
      if (targetSocket) {
        io.to(targetSocket).emit('typing', { senderId: socket.user.id });
      }
    });

    socket.on('disconnect', () => {
      activeUsers.delete(String(socket.user.id));
      io.emit('presence:update', Array.from(activeUsers.keys()));
    });
  });

  return io;
}

module.exports = {
  initChatSocket,
};
