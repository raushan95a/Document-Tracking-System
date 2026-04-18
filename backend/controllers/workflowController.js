const Workflow = require("../models/Workflow");
const Document = require("../models/Document");
const DocumentLog = require("../models/DocumentLog");
const User = require("../models/User");
const { emitDocumentUpdate } = require("../socket");

const sameDepartment = (left, right) => {
  const a = (left || "").trim().toLowerCase();
  const b = (right || "").trim().toLowerCase();
  return a && b && a === b;
};

const hasDocumentAccess = (user, document, workflow) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "employee") {
    return document.uploadedBy.toString() === user._id.toString();
  }

  if (user.role === "manager") {
    if (sameDepartment(document.department, user.department)) {
      return true;
    }

    return workflow?.assignedTo?.toString() === user._id.toString();
  }

  return false;
};

const getWorkflowByDocumentId = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const workflow = await Workflow.findOne({ documentId }).populate(
      "assignedTo",
      "name username email role department"
    );

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (!hasDocumentAccess(req.user, document, workflow)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(workflow);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateWorkflowStage = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { action, assignedTo, targetDepartment, remarks } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const workflow =
      (await Workflow.findOne({ documentId })) ||
      (await Workflow.create({ documentId, currentStage: document.status }));

    if (!hasDocumentAccess(req.user, document, workflow)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (typeof remarks !== "undefined") {
      document.remarks = remarks;
    }

    if (action === "Forward") {
      if (!targetDepartment || !targetDepartment.trim()) {
        return res.status(400).json({ message: "targetDepartment is required for Forward" });
      }

      document.department = targetDepartment.trim();
      document.status = "Under Review";
      workflow.currentStage = "Under Review";

      if (typeof assignedTo !== "undefined") {
        workflow.assignedTo = assignedTo || null;
      } else {
        const nextManager = await User.findOne({
          role: "manager",
          department: targetDepartment.trim(),
        }).select("_id");
        workflow.assignedTo = nextManager?._id || null;
      }
    }

    if (action === "Approve") {
      document.status = "Approved";
      workflow.currentStage = "Approved";

      if (typeof assignedTo !== "undefined") {
        workflow.assignedTo = assignedTo || null;
      }
    }

    if (action === "Reject") {
      document.status = "Rejected";
      workflow.currentStage = "Rejected";

      if (typeof assignedTo !== "undefined") {
        workflow.assignedTo = assignedTo || null;
      }
    }

    await document.save();
    await workflow.save();

    await DocumentLog.create({
      documentId,
      updatedBy: req.user._id,
      action,
    });

    emitDocumentUpdate({ document, workflow, action });

    const populatedWorkflow = await Workflow.findOne({ documentId }).populate(
      "assignedTo",
      "name username email role department"
    );

    const populatedDocument = await Document.findById(documentId).populate(
      "uploadedBy",
      "name username email role department"
    );

    return res.status(200).json({
      document: populatedDocument,
      workflow: populatedWorkflow,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkflowByDocumentId,
  updateWorkflowStage,
};
