const BaseController = require('./baseController');
const clipboardService = require("../services/clipboardService");

class ClipboardController extends BaseController {

  constructor() {
    super();
    this.getAllClipBoards = this.getAllClipBoards.bind(this);
    this.createClipBoard = this.createClipboard.bind(this);
    this.deleteClipBoardById = this.deleteClipBoardById.bind(this);
  }
  
  async getAllClipBoards(req, res) {
    try {
      const { type, category } = req.query;
      const clipBoards = await clipboardService.getAllClipBoards(type, category);
      this.handleSuccess(res, clipBoards, "Clip boards retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createClipboard(req, res) {
    try {
      const clipBoard = await clipboardService.createClipboard(req.body.clipboardData);
      this.handleSuccess(res, clipBoard, "Clip board created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteClipBoardById(req, res) {
    try {
      await clipboardService.deleteClipBoardById(req.params.id);
      this.handleSuccess(res, null, "Clip board deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
module.exports = ClipboardController;