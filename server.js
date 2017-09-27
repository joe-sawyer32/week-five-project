const express = require("express");
const app = express();
const port = process.env.port || 8000;
const path = require("path");

const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const sessionConfig = require("./middleware/sessionConfig");

// ROUTERS
const newgameRoutes = require("./routes/newgameRoutes");
const gameRoutes = require("./routes/gameRoutes");

// SET ENGINE
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session(sessionConfig));

// ROUTES
app.use("/newgame", newgameRoutes);
app.use("/game", gameRoutes);

app.get("/", function(request, response) {
  response.redirect("/newgame");
});
// app.get("/newgame/login", function(request, response) {
//   response.render("index", {
//     user: request.session.user,
//     errors: request.session.errors
//   });
// });

// app.post("/newgame", function(request, response) {
//   if (!request.session.user) {
//     request.session.user = request.body;
//   }
//   response.render("index", {
//     user: request.session.user,
//     errors: request.session.errors
//   });
// });

// app.post("/newgame/difficulty", checkAuth, function(request, response) {
//   response.render("index", {
//     user: request.session.user,
//     difficulty: true
//   });
// });

// app.post("/newgame/setup", checkAuth, function(request, response) {
//   // select wordset based on requested difficulty
//   wordset = words[request.body.difficulty + "Words"];
//   var mysteryWord = wordset[Math.floor(Math.random() * wordset.length)];
//   var display = [];
//   for (let i = 0; i < mysteryWord.length; i++) {
//     display[i] = "-";
//   }
//   request.session.game = {
//     word: mysteryWord.split(""),
//     guessed: [],
//     display: display,
//     guessCount: startGuesses
//   };
//   response.redirect("/game");
// });

// app.get("/game", checkAuth, function(request, response) {
//   let guessesLeft = request.session.game.guessCount > 0;
//   // unguessed chars if dashes in display
//   let unguessedChars = request.session.game.display.indexOf("-") >= 0;
//   if (guessesLeft) {
//     if (unguessedChars) {
//       if (request.session.errors) {
//         response.render("game", {
//           user: request.session.user,
//           game: request.session.game,
//           errors: request.session.errors
//         });
//       } else {
//         response.render("game", {
//           user: request.session.user,
//           game: request.session.game
//         });
//       }
//     } else {
//       response.render("game", {
//         user: request.session.user,
//         game: request.session.game,
//         gameover: { winner: true }
//       });
//     }
//   } else {
//     request.session.game.word = request.session.game.word.join("");
//     response.render("game", {
//       user: request.session.user,
//       game: request.session.game,
//       gameover: { loser: true }
//     });
//   }
// });

// app.post("/game", checkAuth, checkSingleAlpha, function(request, response) {
//   var guessChar = request.body.guess.toLowerCase();
//   var gameState = request.session.game;
//   // new guess if not in guessed array (no index)
//   var newGuess = gameState.guessed.indexOf(guessChar) < 0;
//   // good guess if in word array
//   var goodGuess = gameState.word.indexOf(guessChar) >= 0;

//   if (newGuess) {
//     gameState.guessed.push(guessChar);
//     if (goodGuess) {
//       gameState.word.forEach(function(char, index) {
//         if (char === guessChar) {
//           gameState.display[index] = char;
//         }
//       });
//     } else {
//       --gameState.guessCount;
//     }
//   } else {
//     return response.render("game", {
//       user: request.session.user,
//       game: request.session.game,
//       errors: { msg: "you already guessed that letter" }
//     });
//   }

//   response.redirect("/game");
// });

app.listen(port, function() {
  console.log("Spinning with express: Port", port);
});
