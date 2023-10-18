const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const token = req.get("Authorization");
  if(!token){
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "shhhBroHeavySecret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Could not authenticate");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
