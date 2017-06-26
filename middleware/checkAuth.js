function checkAuth(request, response, next) {
  if (!request.session.user) {
    request.session.errors = { msg: "please login to begin playing" };
    response.redirect("/");
  } else {
    delete request.session.errors;
    next();
  }
}

module.exports = checkAuth;
