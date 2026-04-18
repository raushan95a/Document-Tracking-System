const DocumentLog = require("../models/DocumentLog");
const Document = require("../models/Document");
const Workflow = require("../models/Workflow");

const sameDepartment = (left, right) => {
  const a = (left || "").trim().toLowerCase();
  const b = (right || "").trim().toLowerCase();
  return a && b && a === b;
};

const managerHasDepartment = (user) => {
  return typeof user?.department === "string" && user.department.trim().length > 0;
};

const getIdString = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  if (typeof value.toString === "function") {
    return value.toString();
  }

  return "";
};

const hasDocumentAccess = (user, document, workflow) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "employee") {
    return getIdString(document.uploadedBy) === getIdString(user._id);
  }

  if (user.role === "manager") {
    return true;
  }

  return false;
};

const getLogsByDocumentId = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const workflow = await Workflow.findOne({ documentId });

    if (!hasDocumentAccess(req.user, document, workflow)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await DocumentLog.find({ documentId })
      .populate("updatedBy", "name email role department")
      .sort({ timestamp: -1 });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLogsByDocumentId,
};
