function checkSingleAlpha(request, response, next) {
  request
    .checkBody("guess", "please select only one character")
    .isLength({ min: 1, max: 1 });
  request
    .checkBody("guess", "please select only an alphabet character")
    .isAlpha();
  let errors = request.validationErrors();

  if (errors) {
    return response.render("../views/game", {
      user: request.session.user,
      game: request.session.game,
      errors: errors
    });
  } else {
    next();
  }
}

module.exports = checkSingleAlpha;
