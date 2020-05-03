const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const message = 'Welcome!'

io.on('connection', (socket) => {
  socket.emit('message', message);

  socket.on('sendMessage', (msg) => {
    io.emit('message', msg)
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});