const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    currentStage: {
      type: String,
      enum: ["Submitted", "Under Review", "Approved", "Rejected"],
      default: "Submitted",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workflow", workflowSchema);
