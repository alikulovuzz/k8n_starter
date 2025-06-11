const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// YAML faylni o'qish
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yml'));

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "K8N API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
    }
  }),
}; 