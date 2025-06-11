const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/', healthController.checkHealth.bind(healthController));

module.exports = router; 