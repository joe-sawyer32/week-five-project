function checkSingleAlpha(request, response, next) {
  request
    .checkBody("guess", "please select only one character")
    .isLength({ min: 1, max: 1 });
  request
    .checkBody("guess", "please select only an alphabet character")
    .isAlpha();
  let errors = request.validationErrors();

  if (errors) {
    console.log("we got errors...");
    console.log("errors: ", errors);
    var errorMessages = [];
    errors.forEach(error => {
      errorMessages.push(error.msg);
    });
    console.log("passing error messages to template: ", errorMessages);
    return response.render("../views/game", {
      user: request.session.user,
      game: request.session.game,
      errors: errorMessages.join(" and ")
    });
  } else {
    next();
  }
}

module.exports = checkSingleAlpha;
