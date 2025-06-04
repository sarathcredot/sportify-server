require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const requestLogger = require('./src/middleware/requestLogger');
const setupSwagger = require('./swagger');
const { apiLimiter, helmetConfig, requestSizeLimit } = require('./src/config/security');
const { cacheMiddleware } = require('./src/config/cache');
const { logger, stream, morganFormat } = require('./src/config/logger');
const { initializeSocket } = require('./src/config/socket');

const app = express();

connectDB();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});
// CORS Configuration
const corsOptions = {
  origin: [
    'https://sportifypro.vercel.app',
    'http://localhost:3000',
    'http://192.168.29.18:3000',
    'https://6sm9fkjp-3000.inc1.devtunnels.ms',
    'https://5pf6w2vt-3000.inc1.devtunnels.ms',
    'https://sportify-pro-admin.vercel.app',
    'https://sportify-pro-admin-dashboard.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Enable if you need to handle cookies/auth
  optionsSuccessStatus: 200 // For legacy browser support
};

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(compression({
  level: 6,
  threshold: 0,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));


app.use(express.json({ limit: requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: requestSizeLimit }));
app.use('/api/', apiLimiter);
app.use(morgan(morganFormat, { stream }));
app.use(morgan("dev"));

app.use('/media', (req, res, next) => {
  if (req.path.endsWith('.html')) {
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
  }
  next();
});
app.use('/media', express.static(path.join(__dirname, 'media'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

const otherRoutes = require('./src/routes/other');
const tournamentRoutes = require('./src/routes/tournament');
const organiserRoutes = require('./src/routes/organiser');
const adminRoutes = require('./src/routes/admin');
const teamManagerRoutes = require('./src/routes/teamManager');
if (process.env.NODE_ENV === 'production') {
  app.use('/api/tournaments', cacheMiddleware(300), tournamentRoutes);
  app.use('/api/organiser', cacheMiddleware(300), organiserRoutes);
  app.use('/api/admin', cacheMiddleware(300), adminRoutes);
  app.use('/api/', cacheMiddleware(300), otherRoutes);
  app.use('/api/team-manager', cacheMiddleware(300), teamManagerRoutes);
} else {
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/organiser', organiserRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/', otherRoutes);
  app.use('/api/team-manager', teamManagerRoutes);
}

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/upload', require('./src/routes/fileUpload'));

app.use(errorHandler);
app.use(requestLogger);

const PORT = process.env.PORT || 5000;

setupSwagger(app);

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Initialize Socket.IO
initializeSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

// Socket.IO setup
// const io = require('socket.io')(server);
// require('./src/socket')(io);
