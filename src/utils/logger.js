const winston = require("winston");

const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    ...(process.env.NODE_ENV !== "production"
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : []),
  ],
});

const logRequest = (req) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    query: req.query,
    requestId: req.id,
    userId: req.user?._id,
  });
};

const logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    ...(req && {
      path: req.path,
      method: req.method,
      requestId: req.id,
      userId: req.user?._id,
    }),
  };

  logger.error("Error occurred", errorLog);
};

module.exports = {
  logger,
  logRequest,
  logError,
};
