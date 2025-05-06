const BaseController = require('./baseController');
const clipboardService = require("../services/clipboardService");

class ClipboardController extends BaseController {

  constructor() {
    super();
    this.getAllClipboards = this.getAllClipboards.bind(this);
    this.createClipboard = this.createClipboard.bind(this);
    this.deleteClipboardById = this.deleteClipboardById.bind(this);
  }
  
  async getAllClipboards(req, res) {
    try {
      const { type, category } = req.query;
      const clipBoards = await clipboardService.getAllClipboards(type, category);
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

  async deleteClipboardById(req, res) {
    try {
      await clipboardService.deleteClipboardById(req.params.id);
      this.handleSuccess(res, null, "Clip board deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
module.exports = ClipboardController;