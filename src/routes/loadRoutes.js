const express = require('express');
const router = express.Router();
const loadController = require('../controllers/loadController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, loadController.handleLoad.bind(loadController));

module.exports = router; 