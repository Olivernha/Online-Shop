const express = require('express');

const router = express.Router();

//routes list
router.get('/products',function (req,res) {
    res.render('customer/products/all-products');
});
module.exports = router;