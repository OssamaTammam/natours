const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const tokens = require("../utils/tokens");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  verified: {
    type: Boolean,
    default: false,
    select: false,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
    minLength: 8,
    select: false, //Doesn't show in queries
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // this works on create and save only
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
});

//Password encryption hook
userSchema.pre("save", async function (next) {
  //Only run if password is modified else skip this hook
  if (!this.isModified("password") || this.password === undefined) {
    return next();
  }

  //bcrypt algorithm
  this.password = await bcrypt.hash(this.password, 12);

  //delete from DB for security required for input but not for DB
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // JWT can be faster than DB operation
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Query middleware to filter out inactive users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

//Instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = tokens.createRandomToken();

  this.passwordResetToken = tokens.encryptRandomToken(resetToken);

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = tokens.createRandomToken();

  this.emailVerificationToken = tokens.encryptRandomToken(verificationToken);

  this.emailVerificationExpire = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
