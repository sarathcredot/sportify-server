const { verify } = require('jsonwebtoken');
const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token);
    if (!token) {
      throw new Error();
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json(ResponseHandler.error('Please authenticate', error.message, error.message, 401));
  }
};

module.exports = auth;