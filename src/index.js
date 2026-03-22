const { greet } = require("./utils");
const { fetchTodo } = require("./api");

async function main() {
  console.log(greet("Skill Debugger"));

  // BUG: off-by-one — should be todo #1, not #0
  const todo = await fetchTodo(0);
  console.log("Todo:", todo);
}

main();
