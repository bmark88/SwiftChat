const socket = io();

socket.on('message', (message) => {
  console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.message.value
  socket.emit('sendMessage', msg, (error) => {
    error ? console.log(error) : console.log('Message delivered!');
  });
});

document.querySelector('#location-button').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    socket.emit('sendLocation', coords, () => {
      console.log('Location has been shared.')
    });
  });
});