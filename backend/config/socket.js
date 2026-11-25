let ioInstance = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    // Client authenticates room joining
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('join_role', (role) => {
      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

// Emit helper to deliver targeted notification
const emitToUser = (userId, event, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId.toString()}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (ioInstance && role) {
    ioInstance.to(`role_${role}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToRole };
