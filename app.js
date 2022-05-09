const path = require("path");
const express = require("express");
require("dotenv").config();
const db = require("./database/database");
const authRoutes = require("./routes/auth.routes");
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(authRoutes);

db.connectToDatabase().then(()=>{
    app.listen(port);
}).catch(err=>{
    console.log('Failed to connect to database');
    console.log(err)
});
