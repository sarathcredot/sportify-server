const ResponseHandler = require('../utils/responseHandler');
const { logError } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {

  logError(err, req);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json(
    ResponseHandler.error(message, err.errors || null, statusCode)
  );
};

module.exports = errorHandler; 