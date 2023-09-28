const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} is ${err.value}`;

  //400 for bad request
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;

  //400 for bad request
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //Loop over the object's errors
  const validationErrors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${validationErrors.join(". ")}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token! Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Expired token! Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  // Rendered
  else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //Can be sent to client because it's operational (unknown route or so)
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // eslint-disable-next-line no-console
    console.error("ERROR:\n", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  // eslint-disable-next-line no-console
  console.error("ERROR:\n", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  // 500 => internal server error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    //Name isn't in object clone for a reason
    let error = { ...err, name: err.name, message: err.message };

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }
    sendErrorProd(error, req, res);
  }
};
