const express = require("express");
const { body, param } = require("express-validator");
const {
  getWorkflowByDocumentId,
  updateWorkflowStage,
} = require("../controllers/workflowController");
const { protect, managerOrAdmin } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validation");
const { DEPARTMENT_OPTIONS } = require("../constants/departments");

const router = express.Router();

router.get(
  "/:documentId",
  protect,
  [param("documentId").isMongoId().withMessage("Invalid document id")],
  handleValidationErrors,
  getWorkflowByDocumentId
);

router.put(
  "/:documentId",
  protect,
  managerOrAdmin,
  [
    param("documentId").isMongoId().withMessage("Invalid document id"),
    body("action")
      .isIn(["Forward", "Approve", "Reject"])
      .withMessage("Action must be Forward, Approve, or Reject"),
    body("assignedTo").optional({ nullable: true }).isMongoId().withMessage("Invalid assignee id"),
    body("targetDepartment")
      .optional({ nullable: true })
      .isIn(DEPARTMENT_OPTIONS)
      .withMessage("Invalid target department"),
  ],
  handleValidationErrors,
  updateWorkflowStage
);

module.exports = router;
