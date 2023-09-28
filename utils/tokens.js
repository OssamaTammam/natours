const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Helper function to create random tokens
exports.createRandomToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

// Helper function to encrypt tokens
exports.encryptRandomToken = function (token) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const signJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.createJWT = (user, res) => {
  const token = signJWT(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, //HTTPS only
    httpOnly: true, //Makes cookie not accessible by js
  };

  //For testing using postman we want in dev secure = false
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  //attach cookie
  res.cookie("jwt", token, cookieOptions);

  res.test = "this is a test";

  return token;
};
