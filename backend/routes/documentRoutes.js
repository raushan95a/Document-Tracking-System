const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentLogs,
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { handleValidationErrors } = require("../middleware/validation");
const { DEPARTMENT_OPTIONS } = require("../constants/departments");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  upload.single("file"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("department")
      .optional()
      .isIn(DEPARTMENT_OPTIONS)
      .withMessage("Invalid department"),
  ],
  handleValidationErrors,
  createDocument
);

router.get(
  "/",
  [
    query("search").optional().isString().withMessage("Search must be a string"),
    query("department")
      .optional()
      .isIn(DEPARTMENT_OPTIONS)
      .withMessage("Invalid department filter"),
    query("status")
      .optional()
      .isIn(["Submitted", "Under Review", "Approved", "Rejected"])
      .withMessage("Invalid status filter"),
  ],
  handleValidationErrors,
  getDocuments
);

router.get(
  "/:docId/logs",
  [param("docId").isMongoId().withMessage("Invalid document id")],
  handleValidationErrors,
  getDocumentLogs
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid document id")],
  handleValidationErrors,
  getDocumentById
);

router.put(
  "/:id",
  upload.single("file"),
  [
    param("id").isMongoId().withMessage("Invalid document id"),
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description").optional().isString().withMessage("Description must be a string"),
    body("department").optional().isIn(DEPARTMENT_OPTIONS).withMessage("Invalid department"),
    body("remarks").optional().isString().withMessage("Remarks must be a string"),
  ],
  handleValidationErrors,
  updateDocument
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid document id")],
  handleValidationErrors,
  deleteDocument
);

module.exports = router;
