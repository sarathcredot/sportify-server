const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const m2s = require('mongoose-to-swagger');
const Tournament = require('./src/models/Tournament');
const Player = require('./src/models/Player');
const Team = require('./src/models/Team');
const { swaggerSchema } = require('./src/schemas/tournamentSchema');

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Sportify Pro API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Sportify Pro",
        url: "https://sportifypro.com",
        email: "info@sportifypro.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      schemas: {
        Tournament: m2s(Tournament),
        CreateTournament: swaggerSchema,
        Player: m2s(Player),
        Team: m2s(Team),
      }
    }
  },
  apis: ["./src/routes/*.js", "./src/routes/organiser/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
