const stripe = require("stripe")(process.env.STRIPE_KEY);
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
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
    line_items: cart.items.map(function (item) {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.title,
          },
          unit_amount: +item.product.price.toFixed(2) * 100,
        },
        quantity: item.quantity,
      };
    }),
    mode: "payment",
    success_url: "http://localhost:3000/orders/success",
    cancel_url: "http://localhost:3000/orders/failure",
  });

  res.redirect(303, session.url);
}
function getSuccess(req, res) {
  res.render("customer/orders/success");
}
function getFailure(req, res) {
  res.render("customer/orders/failure");
}
async function getInvoice(req, res, next) {
  const orderId = req.params.orderId;
  let order;
  try {
    order = await Order.findById(orderId);
  } catch (e) {
    next(e);
    return;
  }
  if (!order) {
    const error = new Error();
    error.status = 404;
    return next(error);
  }
  if (order.userData._id.toString() !== res.locals.uid) {
    const error = new Error();
    error.status = 500;
    return next(error);
  }
  console.log(orderId);
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("invoices", invoiceName);
  console.log(invoicePath);
  const pdfDoc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="' + invoiceName + '"'
  );
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);
  pdfDoc.fontSize(26).text("Invoice --- Gavin & Oliver", {
    underline: true,
  });
  pdfDoc.text("--------------------------");
  let totalPrice = 0;
  order.productData.items.forEach((prod) => {
    totalPrice += prod.quantity * prod.product.price;
    pdfDoc
      .fontSize(14)
      .text(
        prod.product.title +
          " - " +
          prod.quantity +
          " x " +
          "$ " +
          prod.product.price
      );
  });
  pdfDoc.text("---");
  pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
  pdfDoc.end();
}
module.exports = {
  addOrder: addOrder,
  getOrders: getOrders,
  getSuccess: getSuccess,
  getFailure: getFailure,
  getInvoice: getInvoice,
};
