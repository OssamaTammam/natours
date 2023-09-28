const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Some safety net error handling
//NOT GOOD PRACTICE
//Using as safety net

//Listening to unhandled rejections
process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  //Database doesn't work
  //0 for success and 1 for uncaught exception
  // eslint-disable-next-line no-console
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  //Bad way to shut down we should end server first
  // process.exit(1);
  //Better
  // server.close(() => {
  //   process.exit(1);
  // });
  process.exit(1);
});

//Listening to uncaught exceptions
//Must terminate and restart app
process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  //Database doesn't work
  //0 for success and 1 for uncaught exception
  // eslint-disable-next-line no-console
  console.log("UNCAUGHT EXCEPTION REJECTION! SHUTTING DOWN...");
  //Bad way to shut down we should end server first
  // process.exit(1);
  //Better
  // server.close(() => {
  //   process.exit(1);
  // });
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

//We can add a .catch() clause
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    dbName: "natours",
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("DB Connected");
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}`);
});
