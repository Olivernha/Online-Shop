const express =  require('express');
const imageUploadMiddleware = require('../middlewares/image-upload');
const adminController = require('../controllers/admin.controller');
const router = express.Router();
router.get('/products',adminController.getProducts);
router.get('/products/new',adminController.getNewProduct);
router.post('/products',imageUploadMiddleware,adminController.createNewProduct);
router.get('/products/:id',adminController.getUpdateProduct);
router.post('/products/:id',imageUploadMiddleware,adminController.updateProduct);
module.exports= router;