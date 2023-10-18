const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const feedsController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");
router.get("/posts",isAuth, feedsController.getPosts);
router.post(
  "/post",isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedsController.createPosts
);
router.get("/post/:postId",isAuth, feedsController.getPost);
router.put(
  "/post/:postId",isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedsController.updatePost
);
router.delete("/post/:postId",isAuth, feedsController.deletePost);
module.exports = router;
