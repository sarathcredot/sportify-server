const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("valida",error.errors)
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};

module.exports = validate;