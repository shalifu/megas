import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem('megasToken'),
  },
});

export function connectSocket() {
  socket.auth = { token: localStorage.getItem('megasToken') };
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

// Additional chef chat event handlers can be added here if needed
export function emitChefMessage(data) {
  socket.emit('sendChefMessage', data);
}

export default socket;
