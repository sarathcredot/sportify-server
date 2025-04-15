const mongoose = require("mongoose");
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/database.log' })
  ]
});

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority'
};

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set("debug", true);
    }
    
    mongoose.set("allowDiskUse", true);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Connection attempt ${retryCount + 1} failed: ${error.message}`);
    
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      logger.info(`Retrying connection in ${delay}ms...`);
      await sleep(delay);
      return connectDB(retryCount + 1);
    }
    
    logger.error('Max retries reached. Could not connect to MongoDB');
    process.exit(1);
  }
};

module.exports = connectDB;
