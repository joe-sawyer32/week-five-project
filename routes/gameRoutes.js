var express = require("express");
var gameRoutes = express.Router();

// MIDDLEWARE
const checkAuth = require("../middleware/checkAuth");
const checkSingleAlpha = require("../middleware/checkSingleAlpha");

// ROUTES
gameRoutes.get("/", checkAuth, function(request, response) {
  let guessesLeft = request.session.game.guessCount > 0;
  // unguessed chars if dashes in display
  let unguessedChars = request.session.game.display.indexOf("-") >= 0;
  if (guessesLeft) {
    if (unguessedChars) {
      if (request.session.errors) {
        response.render("game", {
          user: request.session.user,
          game: request.session.game,
          errors: request.session.errors
        });
      } else {
        response.render("game", {
          user: request.session.user,
          game: request.session.game
        });
      }
    } else {
      response.render("game", {
        user: request.session.user,
        game: request.session.game,
        gameover: { winner: true }
      });
    }
  } else {
    request.session.game.word = request.session.game.word.join("");
    response.render("game", {
      user: request.session.user,
      game: request.session.game,
      gameover: { loser: true }
    });
  }
});

gameRoutes.post("/", checkAuth, checkSingleAlpha, function(request, response) {
  var guessChar = request.body.guess.toLowerCase();
  var gameState = request.session.game;
  // new guess if not in guessed array (no index)
  var newGuess = gameState.guessed.indexOf(guessChar) < 0;
  // good guess if in word array
  var goodGuess = gameState.word.indexOf(guessChar) >= 0;

  if (newGuess) {
    gameState.guessed.push(guessChar);
    if (goodGuess) {
      gameState.word.forEach(function(char, index) {
        if (char === guessChar) {
          gameState.display[index] = char;
        }
      });
    } else {
      --gameState.guessCount;
    }
  } else {
    return response.render("game", {
      user: request.session.user,
      game: request.session.game,
      errors: { msg: "you already guessed that letter" }
    });
  }

  response.redirect("/game");
});

module.exports = gameRoutes;
