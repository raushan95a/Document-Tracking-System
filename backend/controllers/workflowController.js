const Workflow = require("../models/Workflow");
const Document = require("../models/Document");
const DocumentLog = require("../models/DocumentLog");
const User = require("../models/User");
const { sendEmail } = require("../config/mail");
const { emitDocumentUpdate } = require("../socket");
const { normalizeDepartment, isValidDepartment } = require("../constants/departments");

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

const buildDepartmentRegex = (department) => {
  return new RegExp(`^\\s*${(department || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
};

const isDocumentUploader = (user, document) => {
  return getIdString(document?.uploadedBy) === getIdString(user?._id);
};

const isWorkflowAssignee = (user, workflow) => {
  return getIdString(workflow?.assignedTo) === getIdString(user?._id);
};

const isDepartmentManagerForDocument = (user, document) => {
  if (user?.role !== "manager" || !managerHasDepartment(user)) {
    return false;
  }

  return sameDepartment(user.department, document?.department);
};

const hasDocumentAccess = (user, document, workflow) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "employee") {
    return isDocumentUploader(user, document) || isWorkflowAssignee(user, workflow);
  }

  if (user.role === "manager") {
    return (
      isDocumentUploader(user, document) ||
      isWorkflowAssignee(user, workflow) ||
      isDepartmentManagerForDocument(user, document)
    );
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

    const isAssigned = isWorkflowAssignee(req.user, workflow);
    const isPrivileged =
      req.user.role === "admin" || isDepartmentManagerForDocument(req.user, document);

    if (!isPrivileged && !isAssigned) {
      return res.status(403).json({ message: "You are not authorized to perform workflow actions" });
    }

    if (typeof remarks !== "undefined") {
      document.remarks = remarks;
    }

    if (action === "Forward") {
      let normalizedTargetDepartment = normalizeDepartment(targetDepartment);

      if (assignedTo) {
        const assignee = await User.findById(assignedTo).select("_id department");

        if (!assignee) {
          return res.status(404).json({ message: "Assigned user not found" });
        }

        normalizedTargetDepartment = normalizeDepartment(assignee.department);
      }

      if (!normalizedTargetDepartment) {
        return res
          .status(400)
          .json({ message: "A valid assignee or targetDepartment is required for Forward" });
      }

      if (!isValidDepartment(normalizedTargetDepartment)) {
        return res.status(400).json({ message: "Invalid target department" });
      }

      document.department = normalizedTargetDepartment;
      document.status = "Under Review";
      workflow.currentStage = "Under Review";

      if (assignedTo) {
        workflow.assignedTo = assignedTo;
      } else {
        const nextManager = await User.findOne({
          role: "manager",
          department: buildDepartmentRegex(normalizedTargetDepartment),
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

    // Send email notifications
    try {
      const uploader = await User.findById(document.uploadedBy);
      const assignee = workflow.assignedTo ? await User.findById(workflow.assignedTo) : null;

      if (uploader && uploader.email) {
        let subject = `Document Status Updated: ${document.title}`;
        let statusText = action === "Forward" ? "Forwarded" : action;
        let html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50;">Document Status Update</h2>
            <p>Hello <strong>${uploader.name}</strong>,</p>
            <p>The status of your document "<strong>${document.title}</strong>" has been updated to <strong>${statusText}</strong>.</p>
            <p><strong>Current Stage:</strong> ${workflow.currentStage}</p>
            <p><strong>Remarks:</strong> ${remarks || "No remarks"}</p>
            <br/>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/documents/${document._id}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Document</a>
            <p style="margin-top: 20px; font-size: 12px; color: #777;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `;
        sendEmail(uploader.email, subject, html).catch((err) => console.error("Uploader email failed", err));
      }

      if (action === "Forward" && assignee && assignee.email) {
        let subject = `New Document Assigned: ${document.title}`;
        let html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2196F3;">New Document Assignment</h2>
            <p>Hello <strong>${assignee.name}</strong>,</p>
            <p>A document "<strong>${document.title}</strong>" has been forwarded to you for review.</p>
            <p><strong>Uploader:</strong> ${uploader?.name || "Unknown"}</p>
            <p><strong>Remarks:</strong> ${remarks || "No remarks"}</p>
            <br/>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/documents/${document._id}" 
               style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Document</a>
            <p style="margin-top: 20px; font-size: 12px; color: #777;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `;
        sendEmail(assignee.email, subject, html).catch((err) => console.error("Assignee email failed", err));
      }
    } catch (mailError) {
      console.error("Mail notification logic error:", mailError);
    }

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
