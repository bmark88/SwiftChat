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

io.on('connection', (socket) => {
  
  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    
    if (error) {
      return cb(error);
    }
    
    socket.join(user.room);
    
    socket.emit('message', generateMessage('Moderator', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Moderator', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    cb();
  });
  socket.on('sendMessage', (msg, cb) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(msg)) {
      return cb('Profanity is not allowed')
    }

    io.to(user.room).emit('message', generateMessage(user.username, msg))
    cb();
  });

  socket.on('sendLocation', (coords, cb) => {
    const url = `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
    cb();
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Moderator', `${user.username} has left!`));

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});