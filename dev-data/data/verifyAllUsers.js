const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../model/tourModel");
const Review = require("../../model/reviewModel");
const User = require("../../model/userModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    dbName: "natours",
  })
  .then(() => {
    console.log("DB Connected");
  });

const verifyAll = async () => {
  await User.updateMany(
    {},
    {
      verified: true,
    },
    {
      validateBeforeSave: false,
    },
  );
  try {
    console.log("Success!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--verify") verifyAll();
