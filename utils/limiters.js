const rateLimit = require("express-rate-limit");

const handler = () => (req, res, next, options) => {
  res.status(options.statusCode).json({
    status: "failed",
    message: options.message,
  });
};

exports.loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 10,
  message: `You have attempted to log in too many times! Try again in 5 minutes.`,
  handler: handler(),
});

exports.requestLimiter = rateLimit({
  max: 100,
  windowsMs: 1 * 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
  handler: handler(),
});
