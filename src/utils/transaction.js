const mongoose = require("mongoose");
const logger = require("../config/logger");

const runAsTransaction = async (callback) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await callback(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error(error);
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  runAsTransaction,
};