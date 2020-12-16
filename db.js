const mongoose = require("mongoose");
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("mongodb+srv://J0615:15171517@anonymous-twitter-clust.gho41.mongodb.net/anonymous-twitterDB?retryWrites=true&w=majority")
            .then(() => {
                console.log("database connection established")
            })
            .catch((err) => {
                console.log("database connection failed" + err)
            })
    }
}


module.exports = new Database();
