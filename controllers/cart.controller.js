const Product = require("../models/product.model");
function getCart(req,res){
    res.render('customer/cart/cart');
}
async function addCartItem(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.body.productId);
  } catch (err) {
    next(err);
    return;
  }
  const cart = res.locals.cart;
  cart.addItem(product);
  req.session.cart = cart;
  res.status(201).json({
    message: "Product added to cart",
    newTotalItems : cart.totalQuantity
  })
}
module.exports = {
  addCartItem,
  getCart
};