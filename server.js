require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const setupSwagger = require('./swagger');

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: [
    'https://sportifypro.vercel.app',
    'http://localhost:3000',
    'http://192.168.29.18:3000',
    'https://6sm9fkjp-3000.inc1.devtunnels.ms'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Enable if you need to handle cookies/auth
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
app.use('/api/tournaments', require('./src/routes/tournament'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/upload', require('./src/routes/fileUpload'));
app.use('/api/organiser', require('./src/routes/organiser'));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

setupSwagger(app);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO setup
// const io = require('socket.io')(server);
// require('./src/socket')(io);
