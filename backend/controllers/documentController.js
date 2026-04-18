const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const Workflow = require("../models/Workflow");
const DocumentLog = require("../models/DocumentLog");
const User = require("../models/User");
const { emitDocumentUpdate } = require("../socket");
const { normalizeDepartment, isValidDepartment } = require("../constants/departments");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sameDepartment = (left, right) => {
  const a = (left || "").trim().toLowerCase();
  const b = (right || "").trim().toLowerCase();
  return a && b && a === b;
};

const managerHasDepartment = (user) => {
  return typeof user?.department === "string" && user.department.trim().length > 0;
};

const buildDepartmentRegex = (department) => {
  return new RegExp(`^\\s*${escapeRegex((department || "").trim())}\\s*$`, "i");
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

const getVisibilityQuery = async (user, filters) => {
  const query = {};

  if (user.role === "employee") {
    const assignedWorkflows = await Workflow.find({ assignedTo: user._id });
    const assignedDocIds = assignedWorkflows.map((w) => w.documentId);
    query.$or = [
      { uploadedBy: user._id },
      { _id: { $in: assignedDocIds } },
    ];
  } else if (user.role === "manager") {
    const assignedWorkflows = await Workflow.find({ assignedTo: user._id });
    const assignedDocIds = assignedWorkflows.map((w) => w.documentId);
    const managerConditions = [{ uploadedBy: user._id }, { _id: { $in: assignedDocIds } }];

    if (managerHasDepartment(user)) {
      managerConditions.push({ department: buildDepartmentRegex(user.department) });
    }

    query.$or = managerConditions;
  }

  const andConditions = [];

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  if (filters.department && user.role !== "manager") {
    andConditions.push({
      department: new RegExp(`^${escapeRegex(filters.department.trim())}$`, "i"),
    });
  }

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), "i");
    andConditions.push({
      $or: [{ title: regex }, { description: regex }],
    });
  }

  if (andConditions.length > 0) {
    if (query.$or) {
      query.$and = [{ $or: query.$or }, ...andConditions];
      delete query.$or;
    } else {
      query.$and = andConditions;
    }
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

    const resolvedDepartment = normalizeDepartment(department || req.user.department || "");

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
      department: buildDepartmentRegex(resolvedDepartment),
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

    const query = await getVisibilityQuery(req.user, filters);

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

    const isOwner = isDocumentUploader(req.user, document);
    const isPrivileged =
      req.user.role === "admin" || isDepartmentManagerForDocument(req.user, document);
    const isAssigned = isWorkflowAssignee(req.user, workflow);

    if (!isPrivileged && !isOwner && !isAssigned) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.file) {
      if (document.fileUrl) {
        const relativePath = document.fileUrl.replace(/^\//, "");
        const filePath = path.join(__dirname, "..", relativePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      document.fileUrl = `/uploads/${req.file.filename}`;
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
      if (!isPrivileged && !isAssigned) {
        return res.status(403).json({ message: "Only manager/admin can change department" });
      }

      const normalizedDepartment = normalizeDepartment(department);

      if (!isValidDepartment(normalizedDepartment)) {
        return res.status(400).json({ message: "Invalid department" });
      }

      document.department = normalizedDepartment;

      const nextManager = await User.findOne({
        role: "manager",
        department: buildDepartmentRegex(normalizedDepartment),
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
