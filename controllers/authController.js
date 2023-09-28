const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const tokens = require("../utils/tokens");

const sendVerificationEmail = async (user, req, next) => {
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verifyURL = `${req.protocol}://${req.get(
      "host",
    )}/api/v1/users/verify-email/${verificationToken}`;

    await new Email(user, verifyURL).sendEmailVerification();
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Please try again later!",
        500,
      ),
    ); //500 => server error
  }
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(newUser, url).sendWelcome();

  //remove password from output
  newUser.password = undefined;

  await sendVerificationEmail(newUser, req, next);

  const token = tokens.createJWT(newUser, res);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide an email and password!", 400));
  }

  //2. Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401)); //401 is unauthorized
  }

  if (!user.verified) {
    await sendVerificationEmail(user, req, next);

    return next(
      new AppError(
        "Please verify your email\n New verification email sent!",
        401,
      ),
    );
  }

  //3. If everything is okay, send token to client
  const token = tokens.createJWT(user, res);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
});

exports.logOut = (req, res) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "logged out",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting token and check if it exits
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in."), 401);
  }

  //2. Verification token
  //Makes a sync func return a promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. Check is user still exits
  const currUser = await User.findById(decoded.id).select("+verified");

  if (!currUser)
    return next(
      new AppError(
        "The user who this token belongs to does no longer exits",
        401,
      ),
    );

  //4. Check if user changed password after JWT was issued
  if (currUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User password changed recently! Please log in again", 401),
    );
  }

  // 5. Check if user is verified
  if (!currUser.verified) {
    return next(
      new AppError(
        "Email not verified! Please verify your email to do the following operation.",
        401,
      ),
    );
  }

  //Grant access to protected route
  //Store user into request (VERY IMPORTANT!)
  req.user = currUser;
  res.locals.user = currUser;

  next();
});

// Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    // Verify token
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // Check is user still exits
      const currUser = await User.findById(decoded.id).select("+verified");

      if (!currUser) {
        return next();
      }

      // Check if user changed password after JWT was issued
      if (currUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // Check if user is verified
      if (!currUser.verified) {
        return next();
      }

      // There is a logged user
      res.locals.user = currUser;

      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

//How to pass arguments to middleware => create a wrapper function
//(...roles) create an array of roles based on how many roles are based
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ["admin","lead-guide"] etc

    //Check if the role has access
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    //If reached it means the role has access
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  //2. Generate token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //Because we modified in our server but didn't save this in the DB

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host",
    )}/api/v1/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Please try again later!",
        500,
      ),
    ); //500 => server error
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  //2. Set new password if token has not expired and there is a user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  //3. Update ChangedPasswordAt property for user
  //Done through middleware

  //4. Log the user in => send JWT
  const token = tokens.createJWT(user, res);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get user from collection
  //Used protected router to check if the user is logged in
  const user = await User.findById({ _id: req.user._id }).select("+password");

  //2. Check if current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Password is incorrect!"), 401);
  }

  //3.If so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4.Log the user in send JWT
  const token = tokens.createJWT(user, res);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.sendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  await sendVerificationEmail(user, req, next);

  res.status(200).json({
    status: "success",
    message: "token sent to email",
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    emailVerificationToken: tokens.encryptRandomToken(req.params.token),
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired!", 400));
  }

  user.verified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "email verified successfully",
  });
});
