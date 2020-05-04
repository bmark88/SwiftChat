const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#location-button');
const $messages = document.querySelector('#message-container');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).calendar()
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (url) => {
  const urlLink = Mustache.render(locationTemplate, {
    username: url.username,
    url,
    createdAt: moment(url.createdAt).calendar()
  });
  $messages.insertAdjacentHTML('beforeend', urlLink);
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  const msg = e.target.elements.message.value
  socket.emit('sendMessage', msg, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    error ? console.log(error) : console.log('Message delivered!');
  });
});

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }
  
  $locationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    socket.emit('sendLocation', coords, () => {
      $locationButton.removeAttribute('disabled');
      console.log('Location has been shared.');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/';
  }
});