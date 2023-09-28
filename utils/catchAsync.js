//Catches async error
// This argument (the asynchronous function) becomes fn inside the catchAsync function.
// The inner arrow function (req, res, next) => { ... } returned by catchAsync captures fn and the parameters req, res, and next. It creates a closure that "remembers" these variables even after catchAsync has finished executing.

module.exports = (fn) => (req, res, next) => {
  // Both are the same
  // fn(req, res, next).catch((err) => next(err));
  fn(req, res, next).catch(next);
};
