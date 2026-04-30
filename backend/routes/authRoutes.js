const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  verifyOTP,
  getProfile,
  getAllUsers,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validation");
const { DEPARTMENT_OPTIONS } = require("../constants/departments");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("role")
      .optional()
      .isIn(["employee", "manager"])
      .withMessage("Invalid role"),
    body("department")
      .trim()
      .notEmpty()
      .withMessage("Department is required")
      .isIn(DEPARTMENT_OPTIONS)
      .withMessage("Invalid department"),
  ],
  handleValidationErrors,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  login
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  handleValidationErrors,
  verifyOTP
);

router.get("/profile", protect, getProfile);
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;