const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
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

app.listen(port, function() {
  console.log("Spinning with express: Port ", port);
});
