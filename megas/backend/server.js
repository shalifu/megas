require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initDB } = require('./config/db');
const { initChatSocket } = require('./sockets/chatSocket');

const port = process.env.PORT || 3001;

const server = http.createServer(app);

async function start() {
  try {
    await initDB();
    initChatSocket(server);
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();