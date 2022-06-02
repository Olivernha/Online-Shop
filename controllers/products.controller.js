const Product = require("../models/product.model");
const ITEMS_PER_PAGE = 1;

async function getAllProducts(req, res, next) {
  const page = +req.query.page || 1;

  try {
    const products = await Product.findAll(page, ITEMS_PER_PAGE);
    const totalItems = await Product.countProducts();
    res.render("customer/products/all-products", {
      products: products,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (error) {
    next(error);
  }
}
async function getProductDetails(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    res.render("customer/products/product-details", { product: product });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getAllProducts: getAllProducts,
  getProductDetails: getProductDetails,
};
