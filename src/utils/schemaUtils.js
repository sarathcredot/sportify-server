const { z } = require("zod");

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());

module.exports = {
  dateSchema,
}; 