const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const loadRoutes = require('./loadRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

router.use('/', healthRoutes);
router.use('/load', loadRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router; 