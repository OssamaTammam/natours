const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

// const varToString = (varObj) => Object.keys(varObj)[0];

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // allow for nested reviews
    let filter = {};

    if (req.params.tourId) {
      filter = {
        tour: req.params.tourId,
      };
    }

    //Build Query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //Exec Query
    // const docs = await features.query.explain();
    const docs = await features.query;

    //Send Response
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //Populating is a process of replacing the references with the actual data
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const doc = await query;

    if (!doc) {
      next(new AppError("No document found for that ID", 404));
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newTour = new Tour({});
    // newTour.save();
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found for that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id });

    if (!doc) {
      next(new AppError("No document found for that ID", 404));
      return;
    }

    res.status(204).json({
      status: "success",
      message: `Document ${req.params.id} deleted`,
    });
  });
