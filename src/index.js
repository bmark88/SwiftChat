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
  socket.broadcast.emit('message', 'A new user has joined!');

  socket.on('sendMessage', (msg) => {
    io.emit('message', msg)
  });

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!');
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});