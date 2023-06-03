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

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//GET INDIVIDUAL
app.get("/todos/:todoId/", async(request, response) =>{
    const {todoId} = request.params;
    const getTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId}`;
    const todoResponse = await db.get(getTodoQuery);
    response.send(todoResponse);
});

//POST
app.post("/todos/", async(request, response)=>{
    const { id, todo, priority, status } = request.body;
    const insertTodoQuery = `INSERT INTO 
    todo (id, todo, priority, status)
    VALUES(${id}, '${todo}', '${priority}', '${status}');`;
    const todoResponse = await db.run(insertTodoQuery);
    response.send("Todo Successfully Added");
});

//PUT
const hasStatus = (requestQuery) => {
    return(
         requestQuery.status !== undefined
  );
};

const hasPriority = (requestQuery) => {
    return(
         requestQuery.priority !== undefined
  );
};

const hasTodo = (requestQuery) => {
    return(
         requestQuery.todo !== undefined
  );
};

app.put("/todos/:todoId/", async(request, response) =>{
    const { todoId } = request.params;
    let updateTodoQuery = "";
    const { id, todo, priority, status } = request.body;
    switch (true) {
        case hasStatus(request.query):
            updateTodoQuery = `
            UPDATE todo
            SET status = '${status}'
            WHERE id = ${todoId};`;
            todoUpdate = await db.run(updateTodoQuery);
            response.send("Status Updated");
            break;
        case hasPriority(request.query):
            updateTodoQuery = `
            UPDATE todo
            SET priority = '${priority}'
            WHERE id = ${todoId};`;
            todoUpdate = await db.run(updateTodoQuery);
            response.send("Priority Updated");
            break;
        case hasTodo(request.query):
            updateTodoQuery = `
            UPDATE todo
            SET todo = '${todo}'
            WHERE id = ${todoId};`;
            todoUpdate = await db.run(updateTodoQuery);
            response.send("Todo Updated");
            break;
    
        default:
            response.send("failed");
            break;
    }    
});

//Delete
app.delete("/todos/:todoId", async(request, response) =>{
    const { todoId } = request.params;
    const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
    const todo = await db.run(deleteTodoQuery);
    response.send("Todo Deleted"); 
});