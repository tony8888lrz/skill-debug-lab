const { add, capitalize } = require("../src/utils");

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.log(`  FAIL: ${label} — got ${actual}, expected ${expected}`);
    failed++;
  }
}

console.log("Running tests...\n");

assert("add(2, 3)", add(2, 3), 5);
assert("add(-1, 1)", add(-1, 1), 0);
assert("capitalize('hello')", capitalize("hello"), "Hello");
assert("capitalize('')", capitalize(""), "");

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
