const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");

const http = require("http");

const mongoOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(
  "mongodb://localhost:27017/finances-app",
  mongoOpts,
  (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully Connected to Database.");
    }
  }
);

const app = express();
const io = require("./lib/socket/io");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

const users = require("./lib/routes/index");
app.use("/users", users);

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const port = process.env.PORT || 5000;

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  console.log(`HTTP Server running on Port: ${port}.`);
});

io.init(httpServer);
