const express = require('express');
const router = express.Router();
const tradingController = require('../controller/tradingController.js');
const authMiddleware = require('../middleware/authMiddleware'); // or whatever you named it

router.post('/order', authMiddleware, tradingController.placeOrder);
module.exports=router;