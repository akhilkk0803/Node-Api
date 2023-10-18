const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const generateError = (msg, code) => {
  const error = new Error(msg);
  error.statusCode = code;
  throw error;
};
exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  console.log(email, name, password);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return generateError("Validation Failed", 422);
  }

  try {
    const hashPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      name,
      password: hashPassword,
    }).save();
    res
      .status(200)
      .json({ message: "User created successfully", userId: user._id });
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return generateError("No user found with this email", 404);
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return generateError("Wrong password", 401);
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "shhhBroHeavySecret",
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({ message: "Login succesful", token, userId: user._id.toString() });
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};
