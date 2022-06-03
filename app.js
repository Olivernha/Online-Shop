
const path = require("path");
require("dotenv").config();
const express = require("express");
const fs = require("fs");
// const https = require("https");
const csrf = require("csurf");
const expressSession = require("express-session");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const createSessionConfig = require("./config/session");
const db = require("./data/database");
const addCsrfTokenMiddleware = require("./middlewares/csrf-token");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const checkAuthStatusMiddleware = require("./middlewares/check-auth");
const protectRoutesMiddleware = require("./middlewares/protect-routes");
const cartMiddleware = require("./middlewares/cart");
const updateCartPricesMiddleware = require("./middlewares/update-cart-prices");
const notFoundMiddleware = require("./middlewares/not-found");
const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const baseRoutes = require("./routes/base.routes");
const adminRoutes = require("./routes/admin.routes");
const cartRoutes = require("./routes/cart.routes");
const ordersRoutes = require("./routes/orders.routes");

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'), {flags: 'a'});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(morgan('combined',{stream: accessLogStream}));
app.use(express.static("public"));
app.use("/products/assets", express.static("product-data"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf());
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

app.use(cartMiddleware);
app.use(updateCartPricesMiddleware);

app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRoutes);
app.use(authRoutes);
app.use(productsRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", protectRoutesMiddleware ,ordersRoutes);
app.use("/admin", protectRoutesMiddleware,adminRoutes);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(function () {
    // https.createServer({
    //   key: privateKey,
    //   cert: certificate
    // },app).listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
    
  })
  .catch(function (error) {
    console.log("Failed to connect to the database!");
    console.log(error);
  });
