const { logger } = require('./config/logger');
const { ROLES } = require('./utils/constants');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

module.exports = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        logger.warn('Connection attempt without token');
        return next(new Error('Authentication token is required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        logger.error('User not found');
        return next(new Error('User not found'));
      }

      // Store user info in socket
      socket.userId = user._id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    logger.info(`New client connected - User ID: ${socket.userId}, Role: ${socket.userRole}`);

    // Handle joining an auction room
    socket.on('join-auction', (room) => {
      socket.join(room);
      logger.info(`Client joined auction room: ${room}`);
    });

    // Handle joining an organizer-specific auction room
    socket.on('join-auction-organizer', (room) => {
      if (socket.userRole === ROLES.ORGANISER) {
        socket.join(`${room}-organizer`);

        logger.info(`Organizer joined auction room: ${room}-organizer`);
      }
    });

    socket.on("concealed-bid-placed", (res) => {
      io.to(`${res?.auctionId}-organizer`).emit('concealed-bid-placed', res);
      console.log("bid", res)
    })

    // Handle leaving an auction room
    socket.on('leave-auction', (room) => {
      socket.leave(room);
      socket.leave(`${room}-organizer`);
      logger.info(`Client left auction room: ${room}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected - User ID: ${socket.userId}`);
    });
  });

  // Export the io instance for use in other files
  return io;
}; 