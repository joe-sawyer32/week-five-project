const express = require("express");
const app = express();
const port = process.env.port || 8000;
const path = require("path");

const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const sessionConfig = require("./sessionConfig");

// GAME SPECIFICS
const words = require("./models/data");
const checkAuth = require("./middleware/checkAuth.js");
const checkSingleAlpha = require("./middleware/checkSingleAlpha.js");
var wordset;
const startGuesses = 8;

// SET ENGINE
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session(sessionConfig));

// function checkAuth(request, response, next) {
//   if (!request.session.user) {
//     request.session.errors = { msg: "Please login to begin playing." };
//     response.redirect("/");
//   } else {
//     delete request.session.errors;
//     next();
//   }
// }

// function checkSingleAlpha(request, response, next) {
//   request
//     .checkBody("guess", "Please select only alphabet character.")
//     .isAlpha();
//   request
//     .checkBody("guess", "Please select one character.")
//     .isLength({ min: 1, max: 1 });
//   let errors = request.validationErrors();
//   request.session.errors = errors;

//   if (errors) {
//     response.redirect("/game");
//   } else {
//     delete request.session.errors;
//     next();
//   }
// }

// ROUTES
app.get("/", (request, response) => {
  response.render("index", {
    user: request.session.user,
    errors: request.session.errors
  });
});

app.post("/users", (request, response) => {
  if (!request.session.user) {
    request.session.user = request.body;
  }
  response.render("index", {
    user: request.session.user,
    errors: request.session.errors
  });
});

app.post("/difficulty", checkAuth, (request, response) => {
  response.render("index", {
    user: request.session.user,
    difficulty: true
  });
});

app.post("/newgame", checkAuth, (request, response) => {
  // select wordset based on requested difficulty
  wordset = words[request.body.difficulty + "Words"];
  var mysteryWord = wordset[Math.floor(Math.random() * wordset.length)];
  console.log(mysteryWord);
  var display = [];
  for (let i = 0; i < mysteryWord.length; i++) {
    display[i] = "-";
  }
  console.log(display);
  request.session.game = {
    word: mysteryWord.split(""),
    guessed: [],
    display: display,
    guessCount: startGuesses
  };
  console.log(request.session.game);
  response.redirect("/game");
});

app.get("/game", checkAuth, (request, response) => {
  console.log("game state: ", request.session);
  let guessesLeft = request.session.game.guessCount > 0;
  // unguessed chars if dashes in display
  let unguessedChars = request.session.game.display.indexOf("-") >= 0;
  if (guessesLeft) {
    if (unguessedChars) {
      console.log("Game still going");
      console.log("validation errors: ", request.session.errors);
      if (request.session.errors) {
        console.log("Rendering with errors");
        response.render("game", {
          user: request.session.user,
          game: request.session.game,
          errors: request.session.errors
        });
      } else {
        console.log("Rendering with no errors");
        response.render("game", {
          user: request.session.user,
          game: request.session.game
        });
      }
    } else {
      console.log("All letters guessed, winner!");
      response.render("game", {
        user: request.session.user,
        game: request.session.game,
        gameover: { winner: true }
      });
    }
  } else {
    request.session.game.word = request.session.game.word.join("");
    console.log("Out of guesses, loser...");
    response.render("game", {
      user: request.session.user,
      game: request.session.game,
      gameover: { loser: true }
    });
  }
});

app.post("/game", checkAuth, checkSingleAlpha, (request, response) => {
  var guessChar = request.body.guess.toLowerCase();
  var gameState = request.session.game;
  console.log(guessChar);
  // new guess if not in guessed array (no index)
  var newGuess = gameState.guessed.indexOf(guessChar) < 0;
  console.log("new guess: ", newGuess);
  // good guess if in word array
  var goodGuess = gameState.word.indexOf(guessChar) >= 0;
  console.log("good guess: ", goodGuess);

  if (newGuess) {
    gameState.guessed.push(guessChar);
    if (goodGuess) {
      gameState.word.forEach((char, index) => {
        if (char === guessChar) {
          gameState.display[index] = char;
        }
      });
    } else {
      gameState.guessCount--;
      // not good guess, message - "Incorrect letter."
    }
  } else {
    // not new guess, error message - "You already guessed that letter."
    return response.render("game", {
      user: request.session.user,
      game: request.session.game,
      errors: { msg: "you already guessed that letter" }
    });
  }

  response.redirect("/game");
});

app.listen(port, () => {
  console.log("Spinning with express: Port", port);
});
