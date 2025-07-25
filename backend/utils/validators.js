const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  // At least 6 characters
  return typeof password === 'string' && password.length >= 6;
};

module.exports = { validateEmail, validatePassword }; 