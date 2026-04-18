const express = require("express");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentLogs,
} = require("../controllers/documentController");
const { protect, managerOrAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.post("/", upload.single("file"), createDocument);
router.get("/", getDocuments);
router.get("/:docId/logs", getDocumentLogs);
router.get("/:id", getDocumentById);
router.put("/:id", managerOrAdmin, updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
