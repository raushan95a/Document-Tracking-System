const express = require("express");
const { body, param } = require("express-validator");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAssignableUsers,
} = require("../controllers/userController");
const { protect, adminOnly, managerOrAdmin } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

router.get("/assignable", protect, managerOrAdmin, getAssignableUsers);

router.get("/", protect, adminOnly, getUsers);

router.get(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("Invalid user id")],
  handleValidationErrors,
  getUserById
);

router.put(
  "/:id",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("role")
      .optional()
      .isIn(["employee", "manager", "admin"])
      .withMessage("Invalid role"),
  ],
  handleValidationErrors,
  updateUser
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("Invalid user id")],
  handleValidationErrors,
  deleteUser
);

module.exports = router;
