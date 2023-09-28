const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");

const globalError = require("./controllers/errorController");

const AppError = require("./utils/appError");
const limiters = require("./utils/limiters");

const app = express();

// rendering engine (supported in express)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//GLOBAL MIDDLEWARES

//Serving stating files
app.use(express.static(path.join(__dirname, "public")));

//Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": [
          "self",
          "http://127.0.0.1:3000",
          "http://localhost:3000",
        ],
        "script-src": [
          "'self'",
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
          "https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.0/axios.min.js",
        ],
        "img-src": [
          "http://localhost:3000",
          "https://tile.openstreetmap.org",
          "http://127.0.0.1:3000",
        ],
      },
    },
  }),
);

// CORS
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  }),
);

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Limit request to prevent brute force attacks

app.use("/api", limiters.requestLimiter); //limit all router starting with /api

//Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: "10kb", //Limited to 10kb
  }),
);

// Cookie parser
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XXS => clean malicious html code
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// To compress our responses (text)
app.use(compression());

//Routing -- Middleware
app.use("/", viewRouter);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

// Route not reached because of middleware
// /* stands for everything
// This is middleware
app.all("*", (req, res, next) => {
  //Whenever you pass an argument it's assumed error and will skip middleware and go to error middleware
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

//Global error handling middleware
app.use(globalError);

module.exports = app;
