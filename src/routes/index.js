const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/health', healthRoutes);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router; 