const Clipboard = require("../models/Clipboard");

class ClipboardService {
  async createClipboard(clipboardData) {
    const clipBoard = await Promise.all([clipboardData?.map((el) => Clipboard.create(el))]);
    return clipBoard;
  } 

  async getAllClipboards(type, category) {
    const query = {};
    if (type) {
      query.type = type;
    }
    if (category) {
      query.target = category;
    }
    const clipBoards = await Clipboard.find(query);
    return clipBoards;
  }

  async deleteClipboardById(id) {
    const clipBoard = await Clipboard.findByIdAndDelete(id);
    if (!clipBoard) {
      throw new Error("Clip board not found");
    }
    return clipBoard;
  }
}

module.exports = new ClipboardService();
