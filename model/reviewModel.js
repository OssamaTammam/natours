const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, "Review must have a rating"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Makes each user get to review each tour once
reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "user",
  //   select: "name photo",
  // }).populate({
  //   path: "tour",
  //   select: "name",
  // });
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this refers to model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to doc which is current review
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/findOneAnd/, async function (next) {
  // Get access to document work around
  this.doc = await this.findOne();
  next();
});

reviewSchema.post(/findOneAnd/, async function () {
  if (this.doc) {
    await this.doc.constructor.calcAverageRatings(this.document.tour);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
