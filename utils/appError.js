//Operation errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    //Error while running the app other errors may be programming errors and we wouldnt want to send that to the client using
    this.isOperational = true;

    // Not gonna appear in stack trace ???
    // Stack trace is the stack of where error happens
    // Memorized don't get it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
