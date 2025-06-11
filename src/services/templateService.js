const Template = require("../models/Template");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");
const _ = require("lodash");
const { uploadThumbnail } = require("./uploadService");

class TemplateService {
  getTemplateFields(templateStr) {
    const ast = handlebars.parse(templateStr);
    const fields = new Set();

    function recurse(node) {
      if (node.type === "MustacheStatement" || node.type === "SubExpression") {
        if (node.path.type === "PathExpression") {
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

  async renderTemplateWithPlaceholders(templateString, placeholderData) {
    const template = handlebars.compile(templateString);
    return template(placeholderData);
  }

  async generateThumbnailFromHTMLContent(htmlContent) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const folder = "thumbnails";
    const page = await browser.newPage();

    // Set content and wait for network to be idle
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });

    // ✅ Improved image loading and fallback handling
    await page.evaluate(async () => {
      const fallbackUrl =
        "https://media.istockphoto.com/id/637332860/photo/multi-sports-proud-players-collage-on-grand-arena.jpg?s=612x612&w=0&k=20&c=mb1qZHDluXcDAp2_hFVHidFbfvCQetRu8Dbs3jPv4mA=";

      const images = Array.from(document.querySelectorAll("img"));

      // Wait for all images to load or timeout
      await Promise.all(
        images.map((img) => {
          return new Promise((resolve) => {
            // If already complete
            if (img.complete && img.naturalWidth !== 0) {
              return resolve();
            }

            // Handle successful load
            img.onload = resolve;

            // Handle error
            img.onerror = () => {
              img.src = fallbackUrl;
              console.log("Error caught - fallback used");
              // Wait for fallback to load
              img.onload = resolve;
            };

            // Timeout after 5 seconds
            setTimeout(() => {
              if (!img.complete || img.naturalWidth === 0) {
                img.src = fallbackUrl;
                console.log("Timeout - using fallback image");
              }
              resolve();
            }, 15000);
          });
        })
      );
    });

    // Alternative to waitForTimeout - works in all Puppeteer versions
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save screenshot
    const { fileName, filePath } = await uploadThumbnail(folder);

    await page.screenshot({
      path: filePath,
      fullPage: true,
      captureBeyondViewport: true,
    });

    await browser.close();

    return `${folder}/${fileName}`;
  }

  async createTemplate(data) {
    const {
      templateType,
      templateData,
      fields,
      templateFileUrl,
      availableForPlan,
    } = data;
    if (!templateType || !templateData) {
      throw new Error("Template type and template data are required");
    }

    const templateFields = this.getTemplateFields(templateData);
    const obj = {
      templateType,
      templateData,
      templateFileUrl,
      availableForPlan,
    };

    if (fields && Array.isArray(fields) && fields.length > 0) {
      obj.fields = fields;
    }

    const placeholderData = {};

    if (templateFields && templateFields.length > 0) {
      obj.fields = { ...obj.fields, ...templateFields };
      templateFields.forEach((field) => {
        const lowerField = field.toLowerCase();
        if (
          lowerField.includes("image") ||
          lowerField.includes("img") ||
          lowerField.includes("logo")
        ) {
          placeholderData[field] =
            "https://lh5.googleusercontent.com/proxy/t08n2HuxPfw8OpbutGWjekHAgxfPFv-pZZ5_-uTfhEGK8B5Lp-VN4VjrdxKtr8acgJA93S14m9NdELzjafFfy13b68pQ7zzDiAmn4Xg8LvsTw1jogn_7wStYeOx7ojx5h63Gliw";
        } else {
          placeholderData[field] = `[Sample ${_.startCase(field)}]`;
        }
      });
    }

    let renderedHTML = null;

    if (placeholderData && Object.keys(placeholderData).length > 0) {
      renderedHTML = await this.renderTemplateWithPlaceholders(
        templateData,
        placeholderData
      );
    }

    let thumbnail = null;

    if (renderedHTML) {
      thumbnail = await this.generateThumbnailFromHTMLContent(renderedHTML);
    }

    if (thumbnail) {
      obj.thumbnail = thumbnail;
    }

    const template = await Template.create(obj);
    return template;
  }

  async getAllTemplates(type, page = 1, limit = 10, availableForPlan) {
    const query = {};

    if (type) {
      query.templateType = type;
    }

    if (availableForPlan) {
      query.availableForPlan = availableForPlan;
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
    const template = await Template.deleteMany({ _id: { $in: ids } });
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
      // if (!fields.includes(key)) {
      //   throw new Error(`Field ${key} not found in template`);
      // }
      if (data[key] === undefined) {
        throw new Error(`Field ${key} is undefined`);
      }
      if (key.toLowerCase().endsWith("url")) {
        data[key] = `${process.env.BASE_URL}/media/${data[key]}`;
      }
    }

    const compiledTemplate = handlebars.compile(templateData);
    const renderedTemplate = compiledTemplate(data);

    // Create a browser instance
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(renderedTemplate);

      await page.evaluate(async () => {
        const selectors = Array.from(document.querySelectorAll("img"));
        await Promise.all([
          document.fonts.ready,
          ...selectors.map((img) => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
              img.addEventListener("load", resolve);
              img.addEventListener("error", reject);
            });
          }),
        ]);
      });

      // Generate the PNG
      const buffer = await page.screenshot({
        type: "png",
        fullPage: true,
        encoding: "binary",
      });

      // Ensure media/posters directory exists
      const postersDir = path.join(process.cwd(), "media", "posters");
      await fs.mkdir(postersDir, { recursive: true });

      // Generate unique filename
      const filename = `template-${templateId}-${Date.now()}.png`;
      const filePath = path.join(postersDir, filename);

      // Save the file
      await fs.writeFile(filePath, buffer);

      // Return the URL
      return {
        url: `/posters/${filename}`,
        filename,
      };
    } finally {
      await browser.close();
    }
  }
}

module.exports = new TemplateService();
