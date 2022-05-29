const path = require("path");
const express = require("express");
const csrf = require("csurf");
const expressSession = require("express-session");
const createSessionConfig = require("./config/session");
require("dotenv").config();
const db = require("./database/database");
const addCsrfTokenMiddleware= require('./middlewares/csrf-token');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const protectedRoutesMiddleware = require('./middlewares/protect-routes');
const cartMiddleware = require('./middlewares/cart');
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const baseRoutes = require("./routes/base.routes");
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/products/assets',express.static(path.join(__dirname, "product-data")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const sessionConfig = createSessionConfig();
app.use(expressSession(sessionConfig));

app.use(csrf());
app.use(cartMiddleware);
app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);
app.use(baseRoutes);
app.use(authRoutes);
app.use(productRoutes);
app.use('/cart',cartRoutes);
app.use(protectedRoutesMiddleware);
app.use('/orders',ordersRoutes);
app.use('/admin',adminRoutes);

app.use(errorHandlerMiddleware);
db.connectToDatabase().then(()=>{
    app.listen(port);
}).catch(err=>{
    console.log('Failed to connect to database');
    console.log(err)
});
