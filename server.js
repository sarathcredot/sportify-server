require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const path = require("path");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.use(morgan('dev'));
app.use("/media", express.static(path.join(__dirname, "media")));

// Routes
app.use('/api/tournaments', require('./src/routes/tournament'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/upload', require('./src/routes/fileUpload'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO setup
// const io = require('socket.io')(server);
// require('./src/socket')(io);