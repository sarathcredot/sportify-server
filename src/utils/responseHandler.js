class ResponseHandler {
  static success(message, data = null, statusCode = 200) {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  static error(message, errors = null, statusCode = 400) {
    return {
      status: 'error',
      message,
      errors,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }
}

module.exports = ResponseHandler; 