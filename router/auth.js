const express = require("express");
const { body } = require("express-validator");
const User = require("../model/user");
const authController = require("../controllers/auth");
const router = express.Router();
router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a valid Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Already exsits");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);
router.post("/login", authController.login);
module.exports = router;
