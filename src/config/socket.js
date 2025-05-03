const socketIO = require('socket.io');

let io = null;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        'https://sportifypro.vercel.app',
        'http://localhost:3000',
        'http://192.168.29.18:3000',
        'https://6sm9fkjp-3000.inc1.devtunnels.ms',
        'https://5pf6w2vt-3000.inc1.devtunnels.ms'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  require('../socket')(io);
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
}; 