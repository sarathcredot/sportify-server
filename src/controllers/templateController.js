const BaseController = require("./baseController");
const templateService = require("../services/templateService");

class TemplateController extends BaseController {
  constructor() {
    super();
    this.getAllTemplates = this.getAllTemplates.bind(this);
    this.createTemplate = this.createTemplate.bind(this);
    this.deleteTemplateById = this.deleteTemplateById.bind(this);
    this.updateTemplateById = this.updateTemplateById.bind(this);
    this.generateImageFromTemplate = this.generateImageFromTemplate.bind(this);
  }

  async getAllTemplates(req, res) {
    try {
      const { type, page, limit } = req.query;
      console.log("template", req.query)
      const templates = await templateService.getAllTemplates(
        type,
        parseInt(page),
        parseInt(limit)
      );
      this.handleSuccess(res, templates, "Templates retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createTemplate(req, res) {
    try {
      const template = await templateService.createTemplate(req.body);
      this.handleSuccess(res, template, "Template created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateTemplateById(req, res) {
    try {
      const template = await templateService.updateTemplate(
        req.params.id,
        req.body
      );
      this.handleSuccess(res, template, "Template updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteTemplateById(req, res) {
    try {
      await templateService.deleteTemplateById(req.params.id);
      this.handleSuccess(res, null, "Template deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  deleteTemplatesByIds = async (req, res) => {
    try {
      await templateService.deleteClipBoardByIds(req.body.ids);
      this.handleSuccess(res, null, "Template deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  async generateImageFromTemplate(req, res) {
    console.log("req", req.body)
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await templateService.generateImageFromTemplate(id, data);
      this.handleSuccess(res, result, "Image generated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = TemplateController;
