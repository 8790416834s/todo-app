const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000/....");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//GET ALL
app.get("/todos/", async (request, response) => {
  const { status } = request.query;
  const getTodosQuery = `
    SELECT * FROM todo
    WHERE status = '${status}';`;
  const todosArray = await db.get(getTodosQuery);
  response.send(todosArray);
});

//GET ALL
app.get("/todos/", async (request, response) => {
  const { priority } = request.query;
  const getTodosQuery = `
    SELECT * FROM todo
    WHERE priority = '${priority}';`;
  const todoArray = await db.get(getTodosQuery);
  response.send(todoArray);
});
