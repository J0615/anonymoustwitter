const express = require("express");
const app = express();
const middleware = require('./middleware');
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("./db");
const session = require("express-session");

app.set('port', process.env.PORT || 3001);
const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "15171517",
    resave: true,
    saveUninitialized: false
}))


const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require('./routes/registerRoutes');
const logoutRoutes = require('./routes/logoutRoutes');

//Api routes
const postsApiRoutes = require("./routes/api/posts");

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/logout", logoutRoutes);

app.use("/api/posts", postsApiRoutes);

app.get("/", middleware.requireLogin, (req, res, next) => {
    let payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }
    res.status(200).render("home", payload);
});

