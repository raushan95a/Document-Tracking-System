const express = require("express");
const { param } = require("express-validator");
const { getLogsByDocumentId } = require("../controllers/logController");
const { protect } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

router.get(
  "/:documentId",
  protect,
  [param("documentId").isMongoId().withMessage("Invalid document id")],
  handleValidationErrors,
  getLogsByDocumentId
);

module.exports = router;
