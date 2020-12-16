const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require("../schemas/UserSchema");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended: false}));


router.get("/", (req, res, next) => {
    res.status(200).render("login");
})


router.post("/", async (req, res, next) => {
    let payload = req.body;

    //Allowing the user to log in with email or username
    if (req.body.logUsername && req.body.logPassword) {


        let user = await User.findOne({
            $or: [
                {username: req.body.logUsername},
                {email: req.body.logUsername}
            ]
        })
            .catch((error) => {
                console.log(error);
                payload.errorMessage = "Something went wrong.";
                res.status(200).render("login", payload);
            });


        if (user) {
            let result = bcrypt.compare(user.password, req.body.logPassword)
            if (result) {
                req.session.user = user;
                return res.redirect("/")
            }
        }

        payload.errorMessage = "Login combination invalid";
        return res.status(200).render("login", payload);
    }
    payload.errorMessage = "Invalid input";
    res.status(200).render("login");

})

module.exports = router;