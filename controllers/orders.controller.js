const Order = require("../models/order.model");
const User = require("../models/user.model");
function getOrders(req, res) {
  res.render("customer/orders/all-orders");
}
async function addOrder(req,res) {
  const cart = res.locals.cart;
  let userDocument;
  try {
    userDocument = await User.findById(res.locals.uid);
  } catch (err) {
    return next(err);
  }

  const order = new Order(cart, userDocument);
  try {
    await order.save();
  } catch (err) {
    next(err);
    return;
  }
  req.session.cart = null;
  res.redirect("/orders");
}
module.exports = {
  addOrder,
  getOrders
};
