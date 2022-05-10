const path = require("path");
const express = require("express");
const csrf = require("csurf");
require("dotenv").config();
const db = require("./database/database");
const addCsrfTokenMiddleware= require('./middlewares/csrf-token');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const authRoutes = require("./routes/auth.routes");
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(csrf());
app.use(addCsrfTokenMiddleware);
app.use(authRoutes);
app.use(errorHandlerMiddleware);
db.connectToDatabase().then(()=>{
    app.listen(port);
}).catch(err=>{
    console.log('Failed to connect to database');
    console.log(err)
});
