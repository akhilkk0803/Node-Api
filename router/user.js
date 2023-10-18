const express = require("express");
const router = express.Router();
const isauth = require("../middleware/is-auth");
const userController = require("../controllers/user");
router.get("/status", isauth, userController.getStatus);
router.put("/status", isauth, userController.updateStatus);
module.exports = router;
