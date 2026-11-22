import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth.store";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001", {
      autoConnect: false, // we connect explicitly when a board opens
      transports: ["websocket"], // skip HTTP long-polling
      // transports: ["websocket"]: by default Socket.IO starts with HTTP long-polling and upgrades to WebSocket. Polling sends several HTTP requests that all have to reach the same server. With your Redis adapter and more than one API instance, that would need "sticky sessions" on the load balancer. Using WebSocket only avoids that.
      // a FUNCTION, not a value: called on every (re)connect → always the latest token
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    });
  }
  return socket;
}

/** Close the connection (on logout) so the next user gets a fresh, re-authenticated one. */
export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
