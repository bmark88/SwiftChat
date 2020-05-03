const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const message = "Welcome!";

io.on('connection', (socket) => {
  
  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    
    if (error) {
      return cb(error);
    }
    
    socket.join(user.room);
    
    socket.emit('message', generateMessage(message));
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));

    cb();
  });
  socket.on('sendMessage', (msg, cb) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return cb('Profanity is not allowed')
    }

    if (msg !== "") {
      io.to('1').emit('message', generateMessage(msg))
    }
    cb();
  });

  socket.on('sendLocation', (coords, cb) => {
    const url = `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`

    io.emit('locationMessage', generateLocationMessage(url))
    cb();
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});