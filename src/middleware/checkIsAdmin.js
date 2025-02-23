const ResponseHandler = require('../utils/responseHandler');
const { ROLES } = require('../utils/constants');


const checkIsAdmin = (model) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== ROLES.ADMIN) {      
        return res.status(403).json(ResponseHandler.error('Access denied', 'You do not have permission to perform this action', 403));
      }
      next();
    } catch (error) {
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  };
};

module.exports = checkIsAdmin;