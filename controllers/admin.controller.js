const Product = require('../models/product.model')
function getProducts(req, res) {
  res.render("admin/products/all-products");
}
function getNewProduct(req, res) {
  return res.render("admin/products/new-product");
}
async function createNewProduct(req, res) {
  const product = new Product({ ...req.body, image: req.file.filename });

  try {
    await product.save();
  } catch (err) {
    next(err);
    return;
  }
  res.redirect("/admin/products");
}
module.exports = {
  getNewProduct,
  getProducts,
  createNewProduct,
};
