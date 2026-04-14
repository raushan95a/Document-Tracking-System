const DocumentLog = require("../models/DocumentLog");

const getLogsByDocumentId = async (req, res) => {
  try {
    const { docId } = req.params;

    const logs = await DocumentLog.find({ documentId: docId })
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
