const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Tour = require("../model/tourModel");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find(); // Array of tour objects

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name", 404));
  }

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Signup",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};
