const stripe = require("stripe")(process.env.STRIPE_KEY);
const Order = require("../models/order.model");
const User = require("../models/user.model");

async function getOrders(req, res, next) {
  try {
    const orders = await Order.findAllForUser(res.locals.uid);
    res.render("customer/orders/all-orders", {
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function addOrder(req, res, next) {
  const cart = res.locals.cart;
  let userDocument;
  try {
    userDocument = await User.findById(res.locals.uid);
  } catch (error) {
    return next(error);
  }

  const order = new Order(cart, userDocument);

  try {
    await order.save();
  } catch (error) {
    next(error);
    return;
  }

  req.session.cart = null;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "dummy",
          },
          unit_amount_decimal: 10.99
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "localhost:3000/orders/success",
    cancel_url: "localhost:3000/orders/failure",
  });
  res.redirect(303, session.url);
}
function getSuccess(req,res){
  res.render("customer/orders/success");
}
function getFailure(req,res){
  res.render("customer/orders/failure");
}
module.exports = {
  addOrder: addOrder,
  getOrders: getOrders,
    getSuccess: getSuccess,
    getFailure: getFailure
};
