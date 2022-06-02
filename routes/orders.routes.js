const express = require('express');
const ordersController = require('../controllers/orders.controller');
const router = express.Router();

//routes list

router.post('/',ordersController.addOrder);
router.get('/',ordersController.getOrders);
router.get('/success',ordersController.getSuccess);
router.get('/failure',ordersController.getFailure);
router.get('/:orderId',ordersController.getInvoice);
module.exports = router;