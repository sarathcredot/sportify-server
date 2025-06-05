const { z } = require('zod');
const ResponseHandler = require('./responseHandler');

const validate = (schema) => (req, res, next) => {

  console.log("sponser", req.body)

  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("validation error", error.errors)
      return res.status(400).json(ResponseHandler.error("Validation error", error.errors, 400));
    }
    next(error);
  }
};

module.exports = validate;