const ClipBoard = require("../models/ClipBoard");

class ClipboardService {
  async createClipboard(clipboardData) {
    const clipBoard = await ClipBoard.create(clipboardData);
    return clipBoard;
  } 

  async getAllClipBoards(type, category) {
    const query = {};
    if (type) {
      query.type = type;
    }
    if (category) {
      query.target = category;
    }
    const clipBoards = await ClipBoard.find(query);
    return clipBoards;
  }

  async deleteClipBoardById(id) {
    const clipBoard = await ClipBoard.findByIdAndDelete(id);
    if (!clipBoard) {
      throw new Error("Clip board not found");
    }
    return clipBoard;
  }
}

module.exports = new ClipboardService();
