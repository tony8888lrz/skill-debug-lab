# Skill Debug Lab

A tiny Node.js project with intentional bugs for testing Claude Code skills.

## Structure
- `src/index.js` — entry point
- `src/utils.js` — utility functions (has a bug in `add`)
- `src/api.js` — API helpers (has a bug in `fetchUser`)
- `test/run.js` — simple test runner

## Commands
- `npm start` — run the app
- `npm test` — run tests (currently failing due to bugs)

## Known intentional bugs
1. `add()` subtracts instead of adding
2. `fetchUser()` hits the wrong endpoint
3. `fetchTodo(0)` in index.js — off-by-one
