const Tournament = require('../models/Tournament');
const ResponseHandler = require('../utils/responseHandler');

const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const resource = await model.findById(id);
      if (!resource) {
        return res.status(404).json(ResponseHandler.error(`${model.modelName} not found`, null, 404));
      }
      if (resource.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json(ResponseHandler.error('Access denied', 'You do not have permission to perform this action', 403));
      }
      next();
    } catch (error) {
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  };
};

module.exports = checkOwnership;