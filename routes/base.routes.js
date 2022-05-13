const express = require('express');

const router = express.Router();

//routes list
router.get('/',function (req,res) {
    res.redirect('/products');
});
module.exports = router;