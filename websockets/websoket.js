// 1. Import modules
const { createServer } = require('http');
const { Server } = require('socket.io');
// const server = createServer(app);
let io; 
// const io = new Server(server); 

const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 이벤트 핸들링
    socket.on('message', (data) => {
      console.log('Received message:', data);
      socket.emit('response', `Message received: ${data}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getWebSocketInstance = () => {
  if (!io) {
    throw new Error('WebSocket has not been initialized!');
  }
  return io;
};

module.exports = { initializeWebSocket, getWebSocketInstance };