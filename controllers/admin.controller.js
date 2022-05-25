const Product = require("../models/product.model");
async function getProducts(req, res) {
  try {
    const products = await Product.findAll();

    res.render("admin/products/all-products", { products: products });
  } catch (err) {
    next(err);
    return;
  }
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
async function getUpdateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    res.render("admin/products/update-product", { product: product });
  } catch (err) {
    next(err);
    return;
  }

}
function updateProduct() {}
module.exports = {
  getNewProduct,
  getProducts,
  createNewProduct,
  getUpdateProduct,
  updateProduct,
};
