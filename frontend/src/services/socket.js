import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  socket?.disconnect();
  socket = io(import.meta.env.VITE_SOCKET_URL || undefined, { auth: { token } });
  return socket;
}
export const getSocket = () => socket;
export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
