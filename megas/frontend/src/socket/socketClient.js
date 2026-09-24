import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL
  || import.meta.env.VITE_API_URL
  || window.location.origin;
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

export function ensureSocketConnection(timeoutMs = 8000) {
  if (socket.connected) return Promise.resolve(socket);

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Chat connection timed out.'));
    }, timeoutMs);

    const cleanup = () => {
      window.clearTimeout(timeout);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
    };

    const handleConnect = () => {
      cleanup();
      resolve(socket);
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    socket.once('connect', handleConnect);
    socket.once('connect_error', handleError);
    connectSocket();
  });
}

// Additional chef chat event handlers can be added here if needed
export function emitChefMessage(data) {
  socket.emit('sendChefMessage', data);
}

export default socket;
