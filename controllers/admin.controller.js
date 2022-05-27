const Product = require("../models/product.model");
async function getProducts(req, res, next) {
  try {
    const products = await Product.findAll();

    res.render("admin/products/all-products", { products: products });
  } catch (err) {
    next(err);
    return;
  }
}
function getNewProduct(req, res, next) {
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
async function getUpdateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    res.render("admin/products/update-product", { product: product });
  } catch (err) {
    next(err);
    return;
  }
}
async function updateProduct(req, res, next) {
  const product = new Product({
    ...req.body,
    _id: req.params.id,
  });

  if (req.file) {
    //  replace the old image with the new one
    product.replaceImage(req.file.filename);
  }
  try {
    await product.save();
  } catch (err) {
    next(err);
    return;
  }
  res.redirect("/admin/products");
}
async function deleteProduct(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.params.id);
    await product.remove();
  } catch (err) {
    next(err);
    return;
  }
  //   res.redirect("/admin/products");
  res.json({
    message: "Product deleted successfully",
  });
}
module.exports = {
  getNewProduct,
  getProducts,
  createNewProduct,
  getUpdateProduct,
  updateProduct,
  deleteProduct,
};
