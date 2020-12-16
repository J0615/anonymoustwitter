const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/UserSchema");
const Post = require("../../schemas/PostSchema")


app.use(bodyParser.urlencoded({extended: false}));


router.get("/", async (req, res, next) => {
    Post.find()
        .populate("postedBy")
        .sort({"createdAt": -1})
        .then((results) => {
            res.status(200).send(results)
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

router.get("/:id", async (req, res, next) => {

    let results = await Post.find({_id: req.params.id})
        .populate("postedBy")
        .sort({"createdAt": -1})
        .catch(error => console.log(error))

    results = await User.populate(results, {path: "replyTo.postedBy"});
    results = results[0];
    res.status(200).send(results);


})

router.post("/", async (req, res, next) => {

    if (!req.body.content) {
        return res.sendStatus(400);
    }

    let postData = {
        content: req.body.content,
        postedBy: req.session.user
    };

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
        .then(async (newPost) => {
            newPost = await User.populate(newPost, {path: "postedBy"})

            res.status(200).send(newPost);
        })
        .catch((error) => {
            console.log(error)
            res.sendStatus(400);
        })


})

router.put("/:id/like", async (req, res, next) => {
    let postId = req.params.id;
    let userId = req.session.user._id;

    let isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    //Option to pull (delete like) or add like to the array
    let option = isLiked ? "$pull" : "$addToSet"

    //Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true})
        .catch((error) => {
            console.log(error)
            res.sendStatus(400)
        })


    //Insert post like
    let post = await Post.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new: true})
        .catch((error) => {
            console.log(error)
            res.sendStatus(400)
        })


    res.status(200).send(post);
})


module.exports = router;