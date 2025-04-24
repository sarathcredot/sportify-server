const ResponseHandler = require('../utils/responseHandler');
const { logRequest } = require('../utils/logger');

const requestLogger = (req, res, next) => {

  logRequest(req);

  next();
};

module.exports = requestLogger; 