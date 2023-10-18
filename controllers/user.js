const User = require("../model/user");

exports.getStatus = async (req, res, next) => {
  const user = await User.findById(req.userId);
  return res.json({ status: user.status });
};

exports.updateStatus = async (req, res, next) => {
  const userId = req.userId;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, {
      status: req.body.status,
    });
    if (!updatedUser) {
      const err = new Error("Cannot get user");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ updatedUser });
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};
