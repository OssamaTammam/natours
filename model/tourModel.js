const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "Tour name must be less than or equal 40 characters"],
      minlength: [10, "Tour name must have more than or equal 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "Tour must have duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have group size"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 0.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.6 => 46.66 => 47 => 4,7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      //val is priceDiscount, this is object or doc
      validate: {
        message: "Discount price ({VALUE}) should be below regular price",
        validator: function (val) {
          // this works on new docs only so this doesn't work on update
          return val < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Tour must have description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Tour must have cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      required: true,
      select: false, //Doesn't send it in responses
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // Embedded
    startLocation: {
      // GeoJSON for geo spacial data
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // longitude then latitude
      address: String,
      description: String,
    },
    // Specifying an array would create brand new documents in the database
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Referencing the guides
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User", // Establish the user reference
      },
    ],
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

// Ascending order indexing
// tourSchema.index({ price: 1 });
// Compound index works for individual parts of the index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

//Not in database but calculated so virtual
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//Virtual populate
// Basically the id is called tour in the review model but _id in our model
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour", // Name of field where reference is stored
  localField: "_id", // ID for our tour
});

//Document middleware
//Runs before .save and .create but not insertMany!!
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Post has access to the doc saved and next
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// Embedding tour guides
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

//Query Middleware
//tourSchema.pre("find", function (next)
//Regular expression that specifies all strings starting with "find"
tourSchema.pre(/^find/, function (next) {
  //Query object
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  // This references current query
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });

  next();
});
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(Date.now() - this.start);
//   next();
// });

//Aggregation middleware
// tourSchema.pre("aggregate", function (next) {
//   //Add beginning of array which is the aggregation pipeline
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
