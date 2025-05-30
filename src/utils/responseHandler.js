const { error } = require("winston");
const { logger } = require("./logger");

class ResponseHandler {
  static success(message, data = null, statusCode = 200) {
    logger.info(message, data, statusCode);
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  static error(message, errors = null, statusCode = 400) {
    logger.error(message, errors, statusCode);
    return {
      status: 'error',
      message: errors?.message || message,
      errors,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }
}

module.exports = ResponseHandler; 