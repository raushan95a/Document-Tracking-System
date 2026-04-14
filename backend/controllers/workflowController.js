const Workflow = require("../models/Workflow");

const getWorkflowByDocumentId = async (req, res) => {
  try {
    const { docId } = req.params;

    const workflow = await Workflow.findOne({ documentId: docId }).populate(
      "assignedTo",
      "name email role department"
    );

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    return res.status(200).json(workflow);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateWorkflowStage = async (req, res) => {
  try {
    const { docId } = req.params;
    const { currentStage, assignedTo } = req.body;

    const workflow = await Workflow.findOne({ documentId: docId });

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (currentStage) {
      workflow.currentStage = currentStage;
    }

    if (typeof assignedTo !== "undefined") {
      workflow.assignedTo = assignedTo || null;
    }

    await workflow.save();

    return res.status(200).json(workflow);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkflowByDocumentId,
  updateWorkflowStage,
};
