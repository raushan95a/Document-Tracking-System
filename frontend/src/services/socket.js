import { io } from "socket.io-client";
import { getServerBaseUrl } from "./api";

let socketInstance = null;
let activeToken = "";

export const getSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socketInstance && activeToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  activeToken = token;
  socketInstance = io(getServerBaseUrl(), {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  activeToken = "";
};
