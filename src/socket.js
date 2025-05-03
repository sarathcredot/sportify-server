const { logger } = require('./config/logger');

module.exports = (io) => {
  // io.use((socket, next) => {
  //   const jwtToken = socket.handshake.auth.token;
  //   if (!jwtToken) {
  //     logger.warn('Connection attempt without token');
  //     return next(new Error('Authentication token is required'));
  //   }
  //   try {
  //     const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
  //     if (decoded.type !== 'user') {
  //       logger.error('Invalid token type');
  //       return next(new Error('Invalid token type'));
  //     }
  //     next();
  //   } catch (error) {
  //     logger.error('Token validation failed:', error);
  //     next(new Error('Invalid authentication token'));
  //   }
  // });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    logger.info('New client connected');
    
    // Store the socket ID in the socket object for later use
    socket.on('store-socket-id', (data) => {
      socket.userId = data.userId;
      logger.info(`Socket ID stored for user ${data.userId}`);
    });

    // Handle joining an auction room
    socket.on('join-auction', (room) => {
      socket.join(room);
      logger.info(`Client joined auction room: ${room}`);
    });

    // Handle leaving an auction room
    socket.on('leave-auction', (room) => {
      socket.leave(room);
      logger.info(`Client left auction room: ${room}`);
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected');
    });
  });

  // Export the io instance for use in other files
  return io;
}; 