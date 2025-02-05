const Tournament = require('../models/Tournament');

const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const resource = await model.findById(id);
      if (!resource) {
        return res.status(404).json({ error: `${model.modelName} not found` });
      }
      if (resource.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkOwnership;