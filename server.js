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
  request.session.game = {
    guessCount: 8,
    guessed: [],
    correct: [],
    remaining: mysteryWord.split("")
  };
  response.redirect("/game");
});

app.get("/game", checkAuth, (request, response) => {
  console.log(request.session);
  response.render("game", {
    user: request.session.user,
    game: request.session.game
  });
});

app.post("/guess", checkAuth, (request, response) => {
  var guessChar = request.body;
  var gameState = request.session.game;
  // new guess if not in guessed array (no index)
  var newGuess = gameState.guessed.indexOf(guessChar) < 0;
  console.log("new guess: ", newGuess);
  // bad guess if not in remaining array (no index)
  var goodGuess = gameState.remaining.indexOf(guessChar) >= 0;
  console.log("good guess: ", goodGuess);

  if (newGuess) {
    gameState.guessed.push(guessChar);
    if (goodGuess) {
      gameState.correct.push(guessChar);
      // remaining array stripped of good guess
      gameState.remaining = gameState.remaining.filter(char => {
        return char != guessChar;
      });
    } else {
      gameState.guessCount--;
    }
  }
  response.redirect("/game");
});

app.listen(port, () => {
  console.log("Spinning with express: Port", port);
});
