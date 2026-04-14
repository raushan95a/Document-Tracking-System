const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const Workflow = require("../models/Workflow");
const DocumentLog = require("../models/DocumentLog");

const createDocument = async (req, res) => {
  try {
    const { title, description, department } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await Document.create({
      title,
      description,
      department,
      fileUrl,
      uploadedBy: req.user._id,
    });

    await Workflow.create({
      documentId: document._id,
      currentStage: "Submitted",
    });

    await DocumentLog.create({
      documentId: document._id,
      updatedBy: req.user._id,
      action: "Document Submitted",
    });

    return res.status(201).json(document);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const query = req.user.role === "employee" ? { uploadedBy: req.user._id } : {};

    const documents = await Document.find(query)
      .populate("uploadedBy", "name email role department")
      .sort({ createdAt: -1 });

    const documentIds = documents.map((doc) => doc._id);
    const workflows = await Workflow.find({ documentId: { $in: documentIds } }).populate(
      "assignedTo",
      "name email role department"
    );

    const workflowMap = workflows.reduce((acc, workflow) => {
      acc[workflow.documentId.toString()] = workflow;
      return acc;
    }, {});

    const response = documents.map((doc) => {
      const item = doc.toObject();
      item.workflow = workflowMap[doc._id.toString()] || null;
      return item;
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id).populate(
      "uploadedBy",
      "name email role department"
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (
      req.user.role === "employee" &&
      document.uploadedBy &&
      document.uploadedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const workflow = await Workflow.findOne({ documentId: id }).populate(
      "assignedTo",
      "name email role department"
    );

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
    const { status, remarks, assignedTo } = req.body;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (status) {
      document.status = status;
    }

    if (typeof remarks !== "undefined") {
      document.remarks = remarks;
    }

    await document.save();

    const workflow =
      (await Workflow.findOne({ documentId: id })) ||
      (await Workflow.create({ documentId: id, currentStage: document.status }));

    if (status) {
      workflow.currentStage = status;
    }

    if (typeof assignedTo !== "undefined") {
      workflow.assignedTo = assignedTo || null;
    }

    await workflow.save();

    if (status) {
      await DocumentLog.create({
        documentId: id,
        updatedBy: req.user._id,
        action: `Status updated to ${status}`,
      });
    }

    const populatedDocument = await Document.findById(id).populate(
      "uploadedBy",
      "name email role department"
    );
    const populatedWorkflow = await Workflow.findOne({ documentId: id }).populate(
      "assignedTo",
      "name email role department"
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

    if (
      req.user.role === "employee" &&
      document.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await DocumentLog.find({ documentId: docId })
      .populate("updatedBy", "name email role department")
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
