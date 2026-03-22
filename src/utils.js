function greet(name) {
  return `Hello, ${name}!`;
}

function add(a, b) {
  // BUG: subtraction instead of addition
  return a - b;
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { greet, add, capitalize };
