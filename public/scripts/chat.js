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
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const queryString = Qs.parse(location.search, { ignoreQueryPrefix: true });

let { username, room } = queryString;

// Error handle for edge case when user manually inputs query params into url
if (!queryString.username) {
  username = 'Guest';
} 

if (!queryString.room) {
  room = 'General';
}

localStorage.setItem('username', username);

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  
  const visibleHeight = $messages.offsetHeight;

  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  console.log(message)

  const currentUser = localStorage.getItem('username').toLowerCase();
  let messageColor = '';

  if (message.username === currentUser) {
    messageColor = 'current-user';
  }

  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    style: messageColor,
    createdAt: moment(message.createdAt).calendar()
  });
  
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (url) => {
  const urlLink = Mustache.render(locationTemplate, {
    username: url.username,
    url,
    createdAt: moment(url.createdAt).calendar()
  });
  $messages.insertAdjacentHTML('beforeend', urlLink);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  });

  document.querySelector('#sidebar').innerHTML = html;
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