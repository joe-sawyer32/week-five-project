const express = require("express");
const app = express();
const port = process.env.port || 8000;
const path = require("path");

const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const sessionConfig = require(path.join(__dirname, "sessionConfig"));

// GAME SPECIFICS
const words = require(path.join(__dirname, "data.js"));
const startGuesses = 8;

// SET ENGINE
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "/public"));

// MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session(sessionConfig));

function checkAuth(request, response, next) {
  if (!request.session.user) {
    request.session.errors = { msg: "Please login to begin playing." };
    response.redirect("/");
  } else {
    delete request.session.errors;
    next();
  }
}

function checkSingleAlpha(request, response, next) {
  request
    .checkBody("guess", "Please select only alphabet character.")
    .isAlpha();
  request
    .checkBody("guess", "Please select one character.")
    .isLength({ min: 1, max: 1 });
  let errors = request.validationErrors();
  request.session.errors = errors;

  if (errors) {
    response.redirect("/game");
  } else {
    delete request.session.errors;
    next();
  }
}

function newGameSess(request, response, next) {
  console.log("new game session request: ", request.body);
  if (!request.session.user) {
    request.session.user = request.body;
  }
  var mysteryWord = words[Math.floor(Math.random() * words.length)];
  console.log(mysteryWord);
  request.session.user.word = mysteryWord;
  request.session.game = {
    guessed: [],
    correct: [],
    remaining: mysteryWord.split("")
  };
  next();
}

// ROUTES
app.get("/", (request, response) => {
  response.render("index", { errors: request.session.errors });
});

app.post("/newgame", newGameSess, (request, response) => {
  // need validation

  response.redirect("/game");
});

app.get("/game", checkAuth, (request, response) => {
  let guessesLeft =
    startGuesses -
    (request.session.game.guessed.length - request.session.game.correct.length);

  let unguessedChars = request.session.game.remaining.length;
  if (guessesLeft) {
    if (unguessedChars) {
      console.log("Game still going");
      if (request.session.errors) {
        console.log("Rendering with errors");
        response.render("game", {
          user: request.session.user,
          game: request.session.game,
          guessCount: guessesLeft,
          errors: request.session.errors
        });
      } else {
        console.log("Rendering with no errors");
        response.render("game", {
          user: request.session.user,
          game: request.session.game,
          guessCount: guessesLeft
        });
      }
    } else {
      console.log("All letters guessed, winner!");
      response.render("game", {
        user: request.session.user,
        game: request.session.game,
        guessCount: guessesLeft,
        winner: "user"
      });
    }
  } else {
    console.log("Out of guesses, loser...");
    response.render("game", {
      user: request.session.user,
      game: request.session.game,
      word: request.session.user.word
    });
  }
});

app.post("/guess", checkAuth, checkSingleAlpha, (request, response) => {
  var guessChar = request.body.guess.toLowerCase();
  var gameState = request.session.game;
  console.log(guessChar);
  // new guess if not in guessed array (no index)
  var newGuess = gameState.guessed.indexOf(guessChar) < 0;
  console.log("new guess: ", newGuess);
  // good guess if in remaining array
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
      // not good guess, message - "Incorrect letter."
    }
  } else {
    // not new guess, error message - "You already guessed that letter."
  }

  response.redirect("/game");
});

app.listen(port, () => {
  console.log("Spinning with express: Port", port);
});
