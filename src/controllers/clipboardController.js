const BaseController = require("./baseController");
const clipboardService = require("../services/clipboardService");

class ClipboardController extends BaseController {
  constructor() {
    super();
    this.getAllClipBoards = this.getAllClipBoards.bind(this);
    this.createClipboard = this.createClipBoard.bind(this);
    this.deleteClipboardById = this.deleteClipBoardById.bind(this);
    this.deleteClipboardByIds = this.deleteClipBoardByIds.bind(this);
    this.getAllClipBoardsForUser = this.getAllClipBoardsForUser.bind(this);
  }

  async getAllClipBoardsForUser(req, res) {
    try {
      const { type, category } = req.query;
      const clipBoards = await clipboardService.getAllClipboardsForUser(
        req.user.id,
        type,
        category
      );
      this.handleSuccess(res, clipBoards, "Clip boards retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllClipBoards(req, res) {
    try {
      const { type, category, availableForPlan } = req.query;
      const clipBoards = await clipboardService.getAllClipboards(
        type,
        category,
        availableForPlan
      );
      this.handleSuccess(res, clipBoards, "Clip boards retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  createClipBoard = async (req, res) => {
    try {
      const clipBoard = await clipboardService.createClipboard(
        req.body.clipboardData
      );
      this.handleSuccess(res, clipBoard, "Clip board created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  async deleteClipBoardById(req, res) {
    try {
      await clipboardService.deleteClipboardById(req.params.id);
      this.handleSuccess(res, null, "Clip board deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  deleteClipBoardByIds = async (req, res) => {
    try {
      await clipboardService.deleteClipBoardByIds(req.body.ids);
      this.handleSuccess(res, null, "Clip board deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
module.exports = ClipboardController;
