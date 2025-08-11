const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controller/userController');
const auth = require('../middleware/authMiddleware');

router.get('/dashboard', auth, getDashboard);

module.exports = router;
