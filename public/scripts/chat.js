const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#location-button');
const $messages = document.querySelector('#message-container');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {message});
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (url) => {
  console.log(url);
  const urlLink = Mustache.render(locationTemplate, {url});
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