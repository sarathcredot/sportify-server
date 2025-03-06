const ResponseHandler = require('../utils/responseHandler');
const { ROLES } = require('../utils/constants');


const checkIsOrganiser = (model) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== ROLES.ORGANISER) {      
        return res.status(403).json(ResponseHandler.error('Access denied', 'You do not have permission to perform this action', 403));
      }
      next();
    } catch (error) {
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  };
};

module.exports = checkIsOrganiser;