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

    if (socket.userRole === ROLES.TEAM_MANAGER) {
      socket.join(socket.userId.toString());
    }

    // Handle joining an auction room
    socket.on('join-auction', (room) => {
      socket.join(room);
      logger.info(`Client joined auction room: ${room}`);
    });

    // Handle joining an organizer-specific auction room
    socket.on('join-auction-organizer', (room) => {
      if (socket.userRole === ROLES.ORGANISER) {
        socket.join(`${room}-organizer`);
        socket.join(`${room}-organizer-live-preview`);
        logger.info(`Organizer joined auction room: ${room}-organizer`);
      }
    });

    // Handle joining an organizer-for notification. create room use organizerid

    socket.on('join-organizer-notification', () => {

      if (socket.userRole === ROLES.ORGANISER) {

        socket.join(`${socket?.userId}-organizer-notification`);
        logger.info(`Organizer joined auction room: ${room}-organizer`);
      }
    });


    socket.on("notification-sent", (res) => {

      io.to(`${res?.organiserId}-organizer-notification`).emit('notification-sent', { result });
      console.log("notification", res)

    })


    socket.on("concealed-bid-placed", (res) => {
      io.to(`${res?.auctionId}-organizer`).emit('concealed-bid-placed', res);
      console.log("bid", res)
    })


    // auction start live preview auction-started

    socket.on("auction-started", (res) => {

      io.to(`${res?.auctionId}-organizer-live-preview`).emit("auction-started", res)
      console.log("live preview auction started")

    })


    //  when player sold sent details in live preview   biding-player-live

    socket.on("player-sold-live", (res) => {

      io.to(`${res?.auctionId}-organizer-live-preview`).emit("player-sold-live", res)
      console.log("live preview sent to sold player")

    })

    socket.on("player-unsold-live", (res) => {

      io.to(`${res?.auctionId}-organizer-live-preview`).emit("player-unsold-live", res)
      console.log("live preview sent to sold player")
    })



    // new player selcted details in live preview

    socket.on("biding-player-live", (res) => {

      io.to(`${res?.auctionId}-organizer-live-preview`).emit("biding-player-live", res)
      console.log("live preview sent to new player select")

    })

    // Handle leaving an auction room
    socket.on('leave-auction', (room) => {
      socket.leave(room);
      socket.leave(`${room}-organizer`);
      logger.info(`Client left auction room: ${room}`);
    });

    socket.on('leave-user', () => {
      socket.leave(socket.userId.toString());
      logger.info(`Client left user room: ${socket.userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected - User ID: ${socket.userId}`);
    });
  });





  // Export the io instance for use in other files
  return io;
}; 