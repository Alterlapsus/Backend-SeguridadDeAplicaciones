const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { validateSignup, validateSignin } = require("../middleware/validation");

module.exports = function(app, loginLimiter) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      validateSignup,
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post(
    "/api/auth/signin", 
    [loginLimiter, validateSignin], 
    controller.signin
  );
};