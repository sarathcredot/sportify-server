const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const m2s = require('mongoose-to-swagger');
const Tournament = require('./src/models/Tournament');
const Player = require('./src/models/Player');
const Team = require('./src/models/Team');
const { swaggerSchema } = require('./src/schemas/tournamentSchema');
const { createTeamSchema, approveTeamSchema } = require('./src/schemas/teamSchema');
const { createPlayerSchema, approvePlayerSchema } = require('./src/schemas/playerSchema');

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
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            statusCode: {
              type: 'integer'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            statusCode: {
              type: 'integer'
            }
          }
        },
        Tournament: m2s(Tournament),
        CreateTournament: swaggerSchema,
        Player: m2s(Player),
        Team: m2s(Team),
        CreateTeam: createTeamSchema,
        ApproveTeam: approveTeamSchema,
        ApprovePlayer: approvePlayerSchema,
        CreatePlayer: createPlayerSchema
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
