const { z } = require('zod');
const ResponseHandler = require('./responseHandler');

const validate = (schema) => (req, res, next) => {

  
 
  try {
    console.log(req.body, "REQUEST BODY IN VALIDATE MIDDLEWARE")
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