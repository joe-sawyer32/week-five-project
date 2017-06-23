const express = require("express");
const app = express();
const port = process.env.port || 8000;
const path = require("path");

const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const sessionConfig = require(path.join(__dirname, "sessionConfig"));

// GAME SPECIFIC REQUIRES
const words = require(path.join(__dirname, "data.js"));

// SET ENGINE
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "/public"));

// MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionConfig));
function checkAuth(request, response, next) {
  if (!request.session.user) {
    response.redirect("/");
  } else {
    next();
  }
}

// ROUTES
app.get("/", (request, response) => {
  response.render("index");
});

app.post("/users", (request, response) => {
  // need validation
  request.session.user = request.body;
  var mysteryWord = words[Math.floor(Math.random() * words.length)];
  console.log(mysteryWord);
  mysteryWord = mysteryWord.split("");
  console.log(mysteryWord);
  request.session.game = {
    word: mysteryWord,
    guessCount: 8,
    guessChars: [],
    correctChars: []
  };
  response.redirect("/game");
});

app.get("/game", checkAuth, (request, response) => {
  response.render("game", {
    user: request.session.user,
    game: request.session.game
  });
});

app.post("/guess", checkAuth, (request, response) => {
  var guess = request.body;
  console.log(guess);
  response.redirect("/game");
});

app.listen(port, () => {
  console.log("Spinning with express: Port", port);
});
