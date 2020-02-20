const checkAuthentification = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      return database[id];
    }
  }
  return false;
};

const generateRandomString = () => {
  let result = "";
  let char = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 1; i <= 6; i++) {
    result += char[Math.round(Math.random() * (char.length - 1))];
  }
  return result;
};

module.exports = { checkAuthentification, generateRandomString };
