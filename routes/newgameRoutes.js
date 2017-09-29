var express = require("express");
var newgameRoutes = express.Router();

// GAME SPECIFICS
const words = require("../data/data");
var wordset;
const startGuesses = 8;

// MIDDLEWARE
const checkAuth = require("../middleware/checkAuth");
const checkAlphaNum = require("../middleware/checkAlphaNum");

// ROUTES
newgameRoutes.get("/", function(request, response) {
  response.render("index", {
    user: request.session.user,
    errors: request.session.errors
  });
});

newgameRoutes.post("/", function(request, response) {
  request.session.destroy();
  response.redirect("/");
});

newgameRoutes.post("/login", checkAlphaNum, function(request, response) {
  if (!request.session.user) {
    request.session.user = request.body;
  }
  response.render("index", {
    user: request.session.user,
    errors: request.session.errors
  });
});

newgameRoutes.post("/difficulty", checkAuth, function(request, response) {
  response.render("index", {
    user: request.session.user,
    difficulty: true
  });
});

newgameRoutes.post("/setup", checkAuth, function(request, response) {
  // select wordset based on requested difficulty
  wordset = words[request.body.difficulty + "Words"];
  var mysteryWord = wordset[Math.floor(Math.random() * wordset.length)];
  var display = [];
  for (let i = 0; i < mysteryWord.length; i++) {
    display[i] = "-";
  }
  request.session.game = {
    word: mysteryWord.split(""),
    guessed: [],
    display: display,
    guessCount: startGuesses
  };
  response.redirect("/game");
});

module.exports = newgameRoutes;
