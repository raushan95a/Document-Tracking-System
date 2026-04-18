const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const Workflow = require("../models/Workflow");
const DocumentLog = require("../models/DocumentLog");
const User = require("../models/User");
const { emitDocumentUpdate } = require("../socket");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const getVisibilityQuery = (user, filters) => {
  const query = {};
  const pendingStatuses = ["Submitted", "Under Review"];

  if (user.role === "employee") {
    query.uploadedBy = user._id;
  }

  if (user.role === "manager") {
    query.department = user.department;

    if (!filters.status) {
      query.status = { $in: pendingStatuses };
    }
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.department && user.role !== "manager") {
    query.department = new RegExp(`^${escapeRegex(filters.department.trim())}$`, "i");
  }

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), "i");
    query.$or = [{ title: regex }, { description: regex }];
  }

  return query;
};

const enrichDocuments = async (documents) => {
  if (documents.length === 0) {
    return [];
  }

  const documentIds = documents.map((doc) => doc._id);
  const workflows = await Workflow.find({ documentId: { $in: documentIds } }).populate(
    "assignedTo",
    "name username email role department"
  );

  const workflowMap = workflows.reduce((acc, workflow) => {
    acc[workflow.documentId.toString()] = workflow;
    return acc;
  }, {});

  return documents.map((doc) => {
    const item = doc.toObject();
    item.workflow = workflowMap[doc._id.toString()] || null;
    return item;
  });
};

const getDocumentWithWorkflow = async (id) => {
  const document = await Document.findById(id).populate(
    "uploadedBy",
    "name username email role department"
  );

  if (!document) {
    return { document: null, workflow: null };
  }

  const workflow = await Workflow.findOne({ documentId: id }).populate(
    "assignedTo",
    "name username email role department"
  );

  return { document, workflow };
};

const createDocument = async (req, res) => {
  try {
    const { title, description, department } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const resolvedDepartment = (department || req.user.department || "").trim();

    if (!resolvedDepartment) {
      return res.status(400).json({ message: "Department is required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await Document.create({
      title,
      description,
      department: resolvedDepartment,
      fileUrl,
      uploadedBy: req.user._id,
    });

    const defaultManager = await User.findOne({
      role: "manager",
      department: resolvedDepartment,
    }).select("_id");

    const workflow = await Workflow.create({
      documentId: document._id,
      currentStage: "Submitted",
      assignedTo: defaultManager?._id || null,
    });

    await DocumentLog.create({
      documentId: document._id,
      updatedBy: req.user._id,
      action: "Upload",
    });

    emitDocumentUpdate({ document, workflow, action: "Upload" });

    const response = document.toObject();
    response.workflow = workflow;

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      department: req.query.department,
    };
    const query = getVisibilityQuery(req.user, filters);

    const documents = await Document.find(query)
      .populate("uploadedBy", "name username email role department")
      .sort({ createdAt: -1 });

    const response = await enrichDocuments(documents);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { document, workflow } = await getDocumentWithWorkflow(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!hasDocumentAccess(req.user, document, workflow)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const response = document.toObject();
    response.workflow = workflow;

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, department, remarks } = req.body;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const workflow =
      (await Workflow.findOne({ documentId: id })) ||
      (await Workflow.create({ documentId: id, currentStage: document.status }));

    if (!hasDocumentAccess(req.user, document, workflow)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isPrivileged = req.user.role === "admin" || req.user.role === "manager";

    if (!isPrivileged && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (typeof title !== "undefined") {
      document.title = title;
    }

    if (typeof description !== "undefined") {
      document.description = description;
    }

    if (typeof remarks !== "undefined") {
      document.remarks = remarks;
    }

    if (typeof department !== "undefined") {
      if (!isPrivileged) {
        return res.status(403).json({ message: "Only manager/admin can change department" });
      }

      document.department = department;

      const nextManager = await User.findOne({
        role: "manager",
        department: department,
      }).select("_id");

      workflow.assignedTo = nextManager?._id || null;
    }

    await document.save();
    await workflow.save();

    emitDocumentUpdate({ document, workflow, action: "metadata-updated" });

    const populatedDocument = await Document.findById(id).populate(
      "uploadedBy",
      "name username email role department"
    );
    const populatedWorkflow = await Workflow.findOne({ documentId: id }).populate(
      "assignedTo",
      "name username email role department"
    );

    const response = populatedDocument.toObject();
    response.workflow = populatedWorkflow;

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (document.fileUrl) {
      const relativePath = document.fileUrl.replace(/^\//, "");
      const filePath = path.join(__dirname, "..", relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Workflow.deleteMany({ documentId: id });
    await DocumentLog.deleteMany({ documentId: id });
    await document.deleteOne();

    emitDocumentUpdate({
      document: {
        _id: id,
        uploadedBy: document.uploadedBy,
        department: document.department,
        status: "Deleted",
      },
      workflow: null,
      action: "deleted",
    });

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDocumentLogs = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const workflow = await Workflow.findOne({ documentId: docId });

    if (!hasDocumentAccess(req.user, document, workflow)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await DocumentLog.find({ documentId: docId })
      .populate("updatedBy", "name username email role department")
      .sort({ timestamp: -1 });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentLogs,
};
