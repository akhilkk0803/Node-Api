const express = require("express");
const path = require("path");
const app = express();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const feedRoutes = require("./router/feed");
const authRoutes = require("./router/auth");
const userRoutes = require("./router/user");
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());

    // cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/PNG"
  ) {
    cb(null, true);
  } else cb(null, false);
};
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Origin", "*");

  next();
});
app.options("*", cors());
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  res.status(status).json({ message });
});
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bqfcyuw.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then((res) => {
    const server = app.listen(process.env.PORT || 8080, () => {
      console.log("Server is listening at port 8080");
      const io = require("./socketio").init(server);
      io.on("connection", (socket) => {
        console.log("client connected");
      });
    });
  })
  .catch((err) => console.log(err));
