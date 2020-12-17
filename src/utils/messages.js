const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  };
};

const capitalize = (username) => {
  const userName = username.split(" ");

  for (let i = 0; i < userName.length; i++) {
      userName[i] = userName[i][0].toUpperCase() + userName[i].substr(1);
  }

  return userName.join(" ");
};

module.exports = { generateMessage, generateLocationMessage, capitalize };