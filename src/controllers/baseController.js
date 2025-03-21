const ResponseHandler = require('../utils/responseHandler');

class BaseController {
  handleError(res, error) {
    const errorMap = {
      ValidationError: 400,
      NotFoundError: 404,
      UnauthorizedError: 401,
    };
    
    const statusCode = errorMap[error.name] || 500;
    res.status(statusCode).json(
      ResponseHandler.error(error.message, null, statusCode)
    );
  }

  handleSuccess(res, data, message = null, statusCode = 200) {
    res.status(statusCode).json(
      ResponseHandler.success(message, data)
    );
  }
}

module.exports = BaseController; 