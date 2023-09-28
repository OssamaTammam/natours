const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const limiters = require("../utils/limiters");

const router = express.Router();

// No auth required
router.post("/signup", authController.signUp);
router.post("/login", limiters.loginLimiter, authController.logIn);
router.get("/logout", authController.logOut);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.post("/verify-email/:token", authController.verifyEmail);

// Being logged in required
// Protect all routes
router.use(authController.protect);

router.post("/send-verification-email", authController.sendVerificationEmail);

router.patch("/update-password", authController.updatePassword);

//Current user related routers
router.get("/me", userController.getMe, userController.getUser);
router.patch(
  "/update-me",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete("/delete-me", userController.deleteMe);

// Admin Only
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:Id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
