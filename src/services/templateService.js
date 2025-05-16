const Template = require("../models/Template");
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class TemplateService {

  getTemplateFields(templateStr) {
    const ast = handlebars.parse(templateStr);
    const fields = new Set();

    function recurse(node) {
      if (node.type === 'MustacheStatement' || node.type === 'SubExpression') {
        if (node.path.type === 'PathExpression') {
          fields.add(node.path.original);
        }
      }
      if (node.program) recurse(node.program);
      if (node.inverse) recurse(node.inverse);
      if (Array.isArray(node.body)) {
        node.body.forEach(recurse);
      }
    }

    recurse(ast);
    return Array.from(fields);
  }

  async createTemplate(data) {
    const { templateType, templateData, fields, templateFileUrl } = data;
    if (!templateType || !templateData) {
      throw new Error("Template type and template data are required");
    }

    const templateFields = this.getTemplateFields(templateData);
    const template = await Template.create({ templateType, templateData, fields: { ...fields, ...templateFields }, templateFileUrl });
    return template;
  }

  async getAllTemplates(type, page = 1, limit = 10) {

    const query = {};
    if (type) {
      query.templateType = type;
    }
    const skip = (page - 1) * limit;
    const templates = await Template.find(query).skip(skip).limit(limit);
    const total = await Template.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    return { templates, total, totalPages };
  }

  async deleteTemplateById(id) {
    const template = await Template.findByIdAndDelete(id);
    if (!template) {
      throw new Error("Template not found");
    }
    return template;
  }


  async deleteTemplateByIds(ids) {
    const template = await Template.deleteMany({ _id: { $in: ids } });;
    if (!template || template.length === 0) {
      throw new Error("Template not found!");
    }
    return template;
  }

  async updateTemplate(id, data) {
    const template = await Template.findByIdAndUpdate(id, data, { new: true });
    if (!template) {
      throw new Error("Template not found!");
    }
    return template;
  }

  async generateImageFromTemplate(templateId, data) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const { templateData, fields } = template;

    const keys = Object.keys(data);
    for (const key of keys) {
      if (!fields.includes(key)) {
        throw new Error(`Field ${key} not found in template`);
      }
      if (data[key] === undefined) {
        throw new Error(`Field ${key} is undefined`);
      }
      if (key.toLowerCase().endsWith('url')) {
        data[key] = `${process.env.BASE_URL}/media/${data[key]}`;
      }
    }

    const compiledTemplate = handlebars.compile(templateData);
    const renderedTemplate = compiledTemplate(data);

    // Create a browser instance
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(renderedTemplate);

      await page.evaluate(async () => {
        const selectors = Array.from(document.querySelectorAll('img'));
        await Promise.all([
          document.fonts.ready,
          ...selectors.map(img => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', reject);
            });
          })
        ]);
      });

      // Generate the PNG
      const buffer = await page.screenshot({
        type: 'png',
        fullPage: true,
        encoding: 'binary'
      });

      // Ensure media/posters directory exists
      const postersDir = path.join(process.cwd(), 'media', 'posters');
      await fs.mkdir(postersDir, { recursive: true });

      // Generate unique filename
      const filename = `template-${templateId}-${Date.now()}.png`;
      const filePath = path.join(postersDir, filename);

      // Save the file
      await fs.writeFile(filePath, buffer);

      // Return the URL
      return {
        url: `/media/posters/${filename}`,
        filename
      };
    } finally {
      await browser.close();
    }
  }
}

module.exports = new TemplateService();
