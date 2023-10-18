const Post = require("../model/post");
const User = require("../model/user");
const io = require("../socketio");
const { validationResult } = require("express-validator");
const generateError = (msg, code) => {
  const error = new Error(msg);
  error.statusCode = code;
  throw error;
};
exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .populate("creator")
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({ posts, totalItems: totalItems });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};
exports.createPosts = (req, res, next) => {
  // create a post
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("validation failed please enter correct data");
    err.statusCode = 422;
    throw err;
  }
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");
  let creator;
  //getting userId from token in is-auth middleware stored in req.userId

  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      io.getIo().emit("posts", {
        action: "create",
        post: {
          ...post._doc,
          creator: { _id: req.userId, name: creator.name },
        },
      });
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        generateError("Could not find post", 404);
      }
      res.status(200).json({ post: post });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    generateError("No file picked", 422);
  }
  Post.findById(postId)
    .populate("creator")
    .then((post) => {
      if (!post) {
        return generateError("Could not find post", 404);
      }
      if (post.creator._id.toString() !== req.userId) {
        return generateError("Not Authroized", 403);
      }
      post.title = title;
      (post.imageUrl = imageUrl), (post.content = content);
      return post.save();
    })
    .then((result) => {
      io.getIo().emit("posts", { action: "update", post: result });
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch((err) => {
      err.statusCode = 422;
      next(err);
    });
};
exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (post.creator.toString() !== req.userId) {
    return generateError("Not Authroized", 403);
  }
  const user = await User.findById(req.userId);
  user.posts.pull(postId);
  await user.save();
  Post.findByIdAndDelete(postId)
    .then((result) => {
      io.getIo().emit("posts", {
        action: "delete",
        post: postId,
      });
      console.log(result);
      res.status(200).json({ message: "Post deleted successfully" });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};
