const express = require('express');
const ordersController = require('../controllers/orders.controller');
const router = express.Router();

//routes list

router.post('/',ordersController.addOrder);
router.get('/',ordersController.getOrders);

module.exports = router;