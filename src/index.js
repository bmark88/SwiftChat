const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const message = "Welcome!";

io.on('connection', (socket) => {
  socket.emit('message', generateMessage(message));
  socket.broadcast.emit('message', generateMessage('A new user has joined!'));

  socket.on('sendMessage', (msg, cb) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return cb('Profanity is not allowed')
    }

    if (msg !== "") {
      io.emit('message', generateMessage(msg))
    }
    cb();
  });

  socket.on('sendLocation', (coords, cb) => {
    const url = `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`

    io.emit('locationMessage', generateLocationMessage(url))
    cb();
  })

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left!'));
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});