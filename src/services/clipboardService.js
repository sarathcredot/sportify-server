const Clipboard = require("../models/Clipboard");

class ClipboardService {
  async createClipboard(clipboardData) {
    const clipBoard = await Clipboard.create(clipboardData);
    return clipBoard;
  }

  async getAllClipboardsForUser(userId, type, category) {
    const query = {};
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    // TODO: get plan for the user and check if it is available for the plan
    // if (availableForPlan) {
    //   query.availableForPlan = availableForPlan;
    // }
    const clipBoards = await Clipboard.find(query);
    return clipBoards;
  }

  async getAllClipboards(type, category, availableForPlan) {
    const query = {};
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (availableForPlan) {
      query.availableForPlan = availableForPlan;
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
 
  async deleteClipBoardByIds(ids) {
    const clipBoard = await  Clipboard.deleteMany({ _id: { $in: ids } });;
    if (!clipBoard || clipBoard.length === 0) {
      throw new Error("Clip board not found");
    }
    return clipBoard;
  }
}

module.exports = new ClipboardService();
