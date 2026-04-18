const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

let ioInstance = null;

const normalizeDepartment = (department) => {
  if (!department || typeof department !== "string") {
    return "";
  }

  return department.trim().toLowerCase();
};

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || true,
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const tokenFromHeader =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : "";
      const token = socket.handshake.auth?.token || tokenFromHeader;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id role department");

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    socket.join(`role:${socket.user.role}`);

    const department = normalizeDepartment(socket.user.department);
    if (department) {
      socket.join(`department:${department}`);
    }

    socket.on("document:subscribe", (documentId) => {
      if (!documentId) {
        return;
      }

      socket.join(`document:${documentId}`);
    });

    socket.on("document:unsubscribe", (documentId) => {
      if (!documentId) {
        return;
      }

      socket.leave(`document:${documentId}`);
    });
  });

  return ioInstance;
};

const emitDocumentUpdate = ({ document, workflow, action }) => {
  if (!ioInstance || !document || !document._id) {
    return;
  }

  const documentId = document._id.toString();
  const ownerId = document.uploadedBy ? document.uploadedBy.toString() : "";
  const assigneeId = workflow?.assignedTo ? workflow.assignedTo.toString() : "";
  const department = normalizeDepartment(document.department);

  const payload = {
    action: action || "updated",
    documentId,
    status: document.status,
    department: document.department,
    workflowStage: workflow?.currentStage || document.status,
  };

  ioInstance.to(`document:${documentId}`).emit("document:updated", payload);
  ioInstance.to("role:admin").emit("documents:updated", payload);

  if (ownerId) {
    ioInstance.to(`user:${ownerId}`).emit("documents:updated", payload);
  }

  if (assigneeId) {
    ioInstance.to(`user:${assigneeId}`).emit("documents:updated", payload);
  }

  if (department) {
    ioInstance.to(`department:${department}`).emit("documents:updated", payload);
  }
};

module.exports = {
  initSocket,
  emitDocumentUpdate,
};
