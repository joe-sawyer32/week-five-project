function checkAlphaNum(request, response, next) {
  request
    .checkBody("username", "please enter three or more characters")
    .isLength({ min: 3, max: 12 });
  request
    .checkBody("username", "please select only alphanumeric characters")
    .isAlphanumeric();
  let errors = request.validationErrors();

  if (errors) {
    return response.render("../views/index", {
      user: request.session.user,
      game: request.session.game,
      errors: errors
    });
  } else {
    next();
  }
}

module.exports = checkAlphaNum;
