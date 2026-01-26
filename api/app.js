var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const apiRouter = require("./routes/apiRouter");
const cors = require("cors");
const config = require("./config/config");
const connectDB = require("./config/connectDB");
// Register all models immediately after DB connection setup
require("./schemas");

var app = express();

// view engine setup
// app.use("/dev-uploads", express.static(path.join(__dirname, "public", "dev-uploads")));
// app.use(cors({
//   origin: config.allowedOrigin,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
//   maxAge: 600,
//   optionsSuccessStatus: 200
// }));

// app.use(cors({
//   origin: "*",
//   // credentials: true, // Allow sending cookies
// }))

connectDB();

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.set("trust_proxy", true);

// console.log(config.allowedOrigin);

app.use("/", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    status: false,
    error: err,
  });
});

module.exports = app;
