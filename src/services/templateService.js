const Template = require("../models/Template");
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

class TemplateService {
  async createTemplate(templateData) {
    const { templateType, templateData, fields } = templateData;
    if (!templateType || !templateData) {
      throw new Error("Template type and template data are required");
    }
    const template = await Template.create({ templateType, templateData, fields });
    return template;
  } 

  async getAllTemplates(type, page = 1, limit = 10) {
    const query = {};
    if (type) {
      query.type = type;
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

  async updateTemplate(id, data) {
    const template = await Template.findByIdAndUpdate(id, data, { new: true });
    if (!template) {
      throw new Error("Template not found");
    }
    return template;
  }

  async generateImageFromTemplate(templateId, data) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const { templateData, fields } = template;
    
    const compiledTemplate = handlebars.compile(templateData);
    const renderedTemplate = compiledTemplate(fields);
    
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
        fullPage: false,
        encoding: 'binary'
      });

      // Return the image data with headers for download
      return {
        buffer,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="template-${templateId}.png"`,
          'Content-Length': buffer.length
        }
      };
    } finally {
      await browser.close();
    }
  }
}

module.exports = new TemplateService();
