const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const Filter = require('bad-words');

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

  socket.on('sendMessage', (msg, cb) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return cb('Profanity is not allowed')
    }
    io.emit('message', msg)
    cb();
  });

  socket.on('sendLocation', (coords, cb) => {
    io.emit('message', `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`)
    cb();
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!');
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});